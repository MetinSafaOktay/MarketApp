import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { StoreService } from '../store/store.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutPreviewDto } from './dto/checkout-preview.dto';
import {
  DEFAULT_LOCALE,
  Locale,
  pickTranslation,
} from '../../common/i18n/locales';
import { localizeFields } from '../../common/i18n/localize';

/** Sepet CRUD + ödeme önizlemesi. Sepet satırları `cart_items` tablosunda. */

const PRODUCT_I18N = ['name', 'description'] as const;

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService, // checkout-preview kupon doğrulaması
    private readonly storeService: StoreService, // checkout-preview teslimat bölgesi
  ) {}

  // Sepeti ürün + görselleriyle döndürür; ürün adları tek dile çözülür.
  async list(userId: string, locale: Locale = DEFAULT_LOCALE) {
    const items = await this.prisma.cart_items.findMany({
      where: { user_id: userId },
      include: { products: { include: { product_images: true } } },
      orderBy: { added_at: 'desc' },
    });
    return items.map((item) => ({
      ...item,
      products: localizeFields(item.products, locale, PRODUCT_I18N),
    }));
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const quantity = dto.quantity ?? 1;
    // (user_id, product_id) tabloda unique → kullanıcı başına ürün başına tek satır
    const existing = await this.prisma.cart_items.findUnique({
      where: {
        user_id_product_id: { user_id: userId, product_id: dto.product_id },
      },
    });
    if (existing) {
      // zaten varsa yeni satır AÇMA, adedi artır
      return this.prisma.cart_items.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }
    return this.prisma.cart_items.create({
      data: { user_id: userId, product_id: dto.product_id, quantity },
    });
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto) {
    const existing = await this.prisma.cart_items.findUnique({
      where: {
        user_id_product_id: { user_id: userId, product_id: productId },
      },
    });
    if (!existing) throw new NotFoundException('Sepette bu ürün yok');
    return this.prisma.cart_items.update({
      where: { id: existing.id },
      data: { quantity: dto.quantity },
    });
  }

  async removeItem(userId: string, productId: string) {
    await this.prisma.cart_items.deleteMany({
      where: { user_id: userId, product_id: productId },
    });
    return { success: true };
  }

  async clear(userId: string) {
    await this.prisma.cart_items.deleteMany({ where: { user_id: userId } });
    return { success: true };
  }

  /**
   * Sipariş vermeden önce sepet tutarını + kupon indirimini önizler.
   * Geçersiz kupon 400 döndürmez; coupon_error olarak yumuşak bilgilendirir.
   */
  async checkoutPreview(
    userId: string,
    dto: CheckoutPreviewDto,
    locale: Locale = DEFAULT_LOCALE,
  ) {
    const items = await this.prisma.cart_items.findMany({
      where: { user_id: userId },
      include: { products: { include: { product_images: true } } },
      orderBy: { added_at: 'desc' },
    });

    // Her sepet satırı için anlık fiyat + satır toplamı + stok yeterli mi
    const lines = items.map((item) => {
      const unitPrice = Number(item.products.price); // Decimal → number
      const lineTotal = unitPrice * item.quantity;
      return {
        product_id: item.product_id,
        name: pickTranslation(item.products.name, locale),
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        in_stock: item.products.stock_quantity >= item.quantity,
        stock_quantity: item.products.stock_quantity,
      };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.line_total, 0);
    const stockIssues = lines.filter((l) => !l.in_stock); // istemci bunları uyarır

    let discountAmount = 0;
    let coupon: {
      code: string;
      discount_type: string;
      discount_value: number;
    } | null = null;
    let couponError: string | null = null;

    if (dto.coupon_code) {
      try {
        // Kupon geçerli mi + bu sepet tutarına indirimi ne kadar?
        const result = await this.couponsService.validateForOrder(
          dto.coupon_code,
          userId,
          subtotal,
        );
        discountAmount = result.discountAmount;
        coupon = {
          code: result.coupon.code,
          discount_type: result.coupon.discount_type,
          discount_value: Number(result.coupon.discount_value),
        };
      } catch (error) {
        // Kupon reddedildi → istek patlamaz, sebebi yanıta koy (yumuşak hata)
        couponError =
          error instanceof Error ? error.message : 'Kupon uygulanamadı';
      }
    }

    // Teslimat bölgesi: adres verildiyse ve mağaza bölgesi tanımlıysa kontrol et.
    // delivery_area_ok=false → istemci "Sipariş Ver"i mesajla kilitler.
    let deliveryAreaOk = true;
    let deliveryAreaMessage: string | null = null;
    if (dto.address_id) {
      const address = await this.prisma.addresses.findFirst({
        where: { id: dto.address_id, user_id: userId },
        select: { latitude: true, longitude: true },
      });
      const check = await this.storeService.checkAddressInArea(
        address?.latitude,
        address?.longitude,
      );
      deliveryAreaOk = check.ok;
      if (!check.ok) {
        deliveryAreaMessage = `Bu adres teslimat bölgemizin dışında (mağazaya en fazla ${check.radiusKm} km).`;
      }
    }

    return {
      items: lines,
      subtotal,
      discount_amount: discountAmount,
      total: Math.max(0, subtotal - discountAmount), // negatif olamaz
      coupon,
      coupon_error: couponError,
      has_stock_issues: stockIssues.length > 0,
      stock_issues: stockIssues,
      delivery_area_ok: deliveryAreaOk,
      delivery_area_error: deliveryAreaMessage,
    };
  }
}
