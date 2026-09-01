import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import {
  DEFAULT_LOCALE,
  Locale,
  pickTranslation,
} from '../../common/i18n/locales';
import { localizeFields } from '../../common/i18n/localize';

const PRODUCT_I18N = ['name', 'description'] as const;

/** order_items[].products içindeki çok dilli alanları çözer. */
function localizeOrder<T extends { order_items?: unknown[] }>(
  order: T,
  locale: Locale,
): T {
  const items = order.order_items;
  if (!Array.isArray(items)) return order;
  return {
    ...order,
    order_items: items.map((oi) => {
      const item = oi as { products?: Record<string, unknown> | null };
      return item.products
        ? {
            ...item,
            products: localizeFields(item.products, locale, PRODUCT_I18N),
          }
        : item;
    }),
  };
}

/** Müşterinin kendi iptal edebileceği durumlar (hazırlanmaya başlamadan önce). */
const CUSTOMER_CANCELLABLE: string[] = ['pending', 'confirmed'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Sipariş Alındı',
  confirmed: 'Sipariş Onaylandı',
  preparing: 'Hazırlanıyor',
  out_for_delivery: 'Yolda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
};

const WITH_DETAILS = {
  order_items: { include: { products: true } },
  order_status_history: { orderBy: { created_at: 'asc' as const } },
  addresses: true,
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    userId: string,
    dto: CreateOrderDto,
    locale: Locale = DEFAULT_LOCALE,
  ) {
    const address = await this.prisma.addresses.findUnique({
      where: { id: dto.address_id },
    });
    if (!address || address.user_id !== userId) {
      throw new ForbiddenException('Bu adres size ait değil');
    }

    const productIds = dto.items.map((item) => item.product_id);
    const products = await this.prisma.products.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of dto.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new NotFoundException(`Ürün bulunamadı: ${item.product_id}`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new BadRequestException(
          `Stok yetersiz: ${pickTranslation(product.name, locale)}`,
        );
      }
    }

    const subtotal = dto.items.reduce((sum, item) => {
      const product = productMap.get(item.product_id)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    let discountAmount = 0;
    let couponId: string | null = null;
    if (dto.coupon_code) {
      const result = await this.couponsService.validateForOrder(
        dto.coupon_code,
        userId,
        subtotal,
      );
      discountAmount = result.discountAmount;
      couponId = result.coupon.id;
    }

    const totalAmount = subtotal - discountAmount;

    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {
          user_id: userId,
          address_id: dto.address_id,
          subtotal,
          discount_amount: discountAmount,
          coupon_id: couponId,
          total_amount: totalAmount,
          order_items: {
            create: dto.items.map((item) => {
              const product = productMap.get(item.product_id)!;
              return {
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price_snapshot: product.price,
                subtotal: Number(product.price) * item.quantity,
              };
            }),
          },
          order_status_history: {
            create: { status: 'pending', note: 'Sipariş oluşturuldu' },
          },
        },
        include: WITH_DETAILS,
      });

      for (const item of dto.items) {
        await tx.products.update({
          where: { id: item.product_id },
          data: { stock_quantity: { decrement: item.quantity } },
        });
      }

      await tx.cart_items.deleteMany({
        where: { user_id: userId, product_id: { in: productIds } },
      });

      return order;
    });

    return localizeOrder(created, locale);
  }

  async list(
    currentUser: { userId: string; role: string },
    locale: Locale = DEFAULT_LOCALE,
  ) {
    const rows = await this.prisma.orders.findMany({
      where:
        currentUser.role === 'admin' ? {} : { user_id: currentUser.userId },
      include: WITH_DETAILS,
      orderBy: { created_at: 'desc' },
    });
    return rows.map((o) => localizeOrder(o, locale));
  }

  async findOne(
    orderId: string,
    currentUser: { userId: string; role: string },
    locale: Locale = DEFAULT_LOCALE,
  ) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: WITH_DETAILS,
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    if (currentUser.role !== 'admin' && order.user_id !== currentUser.userId) {
      throw new ForbiddenException('Bu sipariş size ait değil');
    }
    return localizeOrder(order, locale);
  }

  async updateStatus(
    orderId: string,
    adminUserId: string,
    dto: UpdateOrderStatusDto,
    locale: Locale = DEFAULT_LOCALE,
  ) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id: orderId },
        data: { status: dto.status, updated_at: new Date() },
      });
      await tx.order_status_history.create({
        data: {
          order_id: orderId,
          status: dto.status,
          changed_by: adminUserId,
          note: dto.note,
        },
      });
      return tx.orders.findUniqueOrThrow({
        where: { id: orderId },
        include: WITH_DETAILS,
      });
    });

    const statusLabel = STATUS_LABELS[dto.status] ?? dto.status;
    await this.notificationsService.create({
      user_id: order.user_id,
      type: 'order_status_update',
      title: statusLabel,
      body: dto.note ?? `Siparişinizin durumu güncellendi: ${statusLabel}`,
      related_order_id: orderId,
    });

    return localizeOrder(updated, locale);
  }

  /**
   * Siparişi iptal eder ve stokları geri yükler.
   * Müşteri yalnızca hazırlanmaya başlamamış (pending/confirmed) siparişini
   * iptal edebilir; admin her aktif siparişi iptal edebilir.
   */
  async cancel(
    orderId: string,
    currentUser: { userId: string; role: string },
    dto: CancelOrderDto,
    locale: Locale = DEFAULT_LOCALE,
  ) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: { order_items: true },
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    const isAdmin = currentUser.role === 'admin';
    if (!isAdmin && order.user_id !== currentUser.userId) {
      throw new ForbiddenException('Bu sipariş size ait değil');
    }
    if (order.status === 'cancelled') {
      throw new BadRequestException('Sipariş zaten iptal edilmiş');
    }
    if (order.status === 'delivered') {
      throw new BadRequestException('Teslim edilmiş sipariş iptal edilemez');
    }
    if (!isAdmin && !CUSTOMER_CANCELLABLE.includes(order.status)) {
      throw new BadRequestException(
        'Sipariş hazırlanmaya başladığı için iptal edilemez, mağaza ile iletişime geçin',
      );
    }

    const note = dto.reason
      ? `İptal nedeni: ${dto.reason}`
      : isAdmin
        ? 'Mağaza tarafından iptal edildi'
        : 'Müşteri tarafından iptal edildi';

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id: orderId },
        data: { status: 'cancelled', updated_at: new Date() },
      });
      await tx.order_status_history.create({
        data: {
          order_id: orderId,
          status: 'cancelled',
          changed_by: currentUser.userId,
          note,
        },
      });
      for (const item of order.order_items) {
        await tx.products.update({
          where: { id: item.product_id },
          data: { stock_quantity: { increment: item.quantity } },
        });
      }
      return tx.orders.findUniqueOrThrow({
        where: { id: orderId },
        include: WITH_DETAILS,
      });
    });

    // Müşteriye bildirim yalnızca mağaza iptal ettiyse (kendi iptalinde gerekmez)
    if (isAdmin) {
      await this.notificationsService.create({
        user_id: order.user_id,
        type: 'order_status_update',
        title: STATUS_LABELS.cancelled,
        body: note,
        related_order_id: orderId,
      });
    }

    return localizeOrder(updated, locale);
  }
}
