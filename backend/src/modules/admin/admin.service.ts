/** Admin dashboard sorguları (salt-okunur, tümü ağır Promise.all paralel). */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, toSkipTake } from '../../common/pagination';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import {
  DEFAULT_LOCALE,
  Locale,
  pickTranslation,
} from '../../common/i18n/locales';
import { localizeFields } from '../../common/i18n/localize';

// "aktif" = teslim edilmemiş ve iptal edilmemiş siparişler (mağazanın ilgilenmesi gerekenler)
const ACTIVE_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
] as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Dashboard üst kartları: sipariş sayıları, ciro, müşteri/ürün sayıları, okunmamış sohbet.
  async stats() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0); // bugünün 00:00'ı
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      ordersTotal,
      ordersActive,
      ordersToday,
      revenueAllTime,
      revenueLast7Days,
      customersTotal,
      customersNewToday,
      productsTotal,
      productsOutOfStock,
      productsLowStock,
      unreadConversations,
    ] = await Promise.all([
      this.prisma.orders.count(),
      this.prisma.orders.count({
        where: { status: { in: [...ACTIVE_ORDER_STATUSES] } },
      }),
      this.prisma.orders.count({ where: { created_at: { gte: todayStart } } }),
      // ciro yalnızca TESLİM EDİLMİŞ siparişlerden (iptal/bekleyen sayılmaz)
      this.prisma.orders.aggregate({
        _sum: { total_amount: true },
        where: { status: 'delivered' },
      }),
      this.prisma.orders.aggregate({
        _sum: { total_amount: true },
        where: { status: 'delivered', created_at: { gte: sevenDaysAgo } },
      }),
      this.prisma.users.count({
        where: { role: 'customer', is_active: true },
      }),
      this.prisma.users.count({
        where: {
          role: 'customer',
          is_active: true,
          created_at: { gte: todayStart },
        },
      }),
      this.prisma.products.count({ where: { is_active: true } }),
      this.prisma.products.count({
        where: { is_active: true, stock_quantity: { lte: 0 } },
      }),
      this.prisma.products.count({
        where: {
          is_active: true,
          stock_quantity: { gt: 0, lte: 5 },
        },
      }),
      this.prisma.conversations.count({
        where: {
          messages: { some: { sender_type: 'user', is_read: false } },
        },
      }),
    ]);

    return {
      orders: {
        total: ordersTotal,
        active: ordersActive,
        today: ordersToday,
      },
      revenue: {
        all_time: Number(revenueAllTime._sum.total_amount ?? 0),
        last_7_days: Number(revenueLast7Days._sum.total_amount ?? 0),
      },
      customers: { total: customersTotal, new_today: customersNewToday },
      products: {
        total: productsTotal,
        out_of_stock: productsOutOfStock,
        low_stock: productsLowStock,
      },
      messaging: { unread_conversations: unreadConversations },
    };
  }

  async listCustomers(query: ListCustomersQueryDto) {
    const { skip, take, page, pageSize } = toSkipTake(
      query.page,
      query.pageSize,
    );

    const where = {
      role: 'customer' as const,
      ...(query.q
        ? {
            OR: [
              {
                profile_name: {
                  contains: query.q,
                  mode: 'insensitive' as const,
                },
              },
              {
                first_name: { contains: query.q, mode: 'insensitive' as const },
              },
              {
                last_name: { contains: query.q, mode: 'insensitive' as const },
              },
              { email: { contains: query.q, mode: 'insensitive' as const } },
              { phone: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        select: {
          id: true,
          profile_name: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          is_active: true,
          created_at: true,
          last_active_at: true,
          _count: { select: { orders: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take,
      }),
      this.prisma.users.count({ where }),
    ]);

    // _count nesnesini düz `order_count` alanına çevir (istemci için sade)
    const data = rows.map(({ _count, ...rest }) => ({
      ...rest,
      order_count: _count.orders,
    }));

    return paginate(data, total, page, pageSize);
  }

  // Stoğu eşiğin altındaki aktif ürünler — admin "yakında bitecek" uyarı listesi.
  // name/description ve kategori adı istenen dile düzleştirilir (mobil admin de kullanıyor).
  async lowStockProducts(threshold = 5, locale: Locale = DEFAULT_LOCALE) {
    const safeThreshold = Math.max(0, Math.min(1000, Math.floor(threshold)));
    const rows = await this.prisma.products.findMany({
      where: { is_active: true, stock_quantity: { lte: safeThreshold } },
      include: { categories: { select: { name: true } } },
      orderBy: { stock_quantity: 'asc' }, // en kritik en üstte
    });
    return rows.map((p) => ({
      ...localizeFields(p, locale, ['name', 'description']),
      categories: p.categories
        ? { name: pickTranslation(p.categories.name, locale) }
        : null,
    }));
  }
}
