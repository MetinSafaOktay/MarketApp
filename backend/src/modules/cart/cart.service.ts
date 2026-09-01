import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutPreviewDto } from './dto/checkout-preview.dto';
import {
  DEFAULT_LOCALE,
  Locale,
  pickTranslation,
} from '../../common/i18n/locales';
import { localizeFields } from '../../common/i18n/localize';

const PRODUCT_I18N = ['name', 'description'] as const;

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
  ) {}

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
    const existing = await this.prisma.cart_items.findUnique({
      where: {
        user_id_product_id: { user_id: userId, product_id: dto.product_id },
      },
    });
    if (existing) {
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

    const lines = items.map((item) => {
      const unitPrice = Number(item.products.price);
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
    const stockIssues = lines.filter((l) => !l.in_stock);

    let discountAmount = 0;
    let coupon: {
      code: string;
      discount_type: string;
      discount_value: number;
    } | null = null;
    let couponError: string | null = null;

    if (dto.coupon_code) {
      try {
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
        couponError =
          error instanceof Error ? error.message : 'Kupon uygulanamadı';
      }
    }

    return {
      items: lines,
      subtotal,
      discount_amount: discountAmount,
      total: Math.max(0, subtotal - discountAmount),
      coupon,
      coupon_error: couponError,
      has_stock_issues: stockIssues.length > 0,
      stock_issues: stockIssues,
    };
  }
}
