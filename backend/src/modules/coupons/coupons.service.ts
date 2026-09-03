/**
 * Kupon CRUD (admin) + `validateForOrder` (sepet/sipariş akışının kalbi).
 * validateForOrder tüm iş kurallarını tek yerde toplar — hem checkout-preview
 * hem gerçek sipariş oluşturma aynı fonksiyonu çağırır (tutarlılık).
 * Bkz. `coupons.service.spec.ts`.
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.coupons.findMany({ orderBy: { code: 'asc' } });
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupons.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('Kupon bulunamadı');
    return coupon;
  }

  create(dto: CreateCouponDto) {
    return this.prisma.coupons.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.assertExists(id);
    return this.prisma.coupons.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.assertExists(id);
    await this.prisma.coupons.delete({ where: { id } });
    return { success: true };
  }

  private async assertExists(id: string) {
    const coupon = await this.prisma.coupons.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Kupon bulunamadı');
    return coupon;
  }

  /**
   * Kupon bu sipariş için geçerli mi? Değilse anlamlı bir BadRequest fırlatır,
   * geçerliyse { coupon, discountAmount } döner. Kontrol sırası:
   *   var mı/aktif mi → tarih aralığı → min sepet tutarı → kullanıcı kullanım limiti.
   * İndirim hesabı en sonda; her iki tipte de indirim sepet tutarını AŞAMAZ.
   */
  async validateForOrder(code: string, userId: string, subtotal: number) {
    const coupon = await this.prisma.coupons.findUnique({ where: { code } });
    if (!coupon || !coupon.is_active) {
      throw new BadRequestException('Kupon geçersiz');
    }

    const now = new Date();
    if (coupon.valid_from && coupon.valid_from > now) {
      throw new BadRequestException('Kupon henüz geçerli değil');
    }
    if (coupon.valid_until && coupon.valid_until < now) {
      throw new BadRequestException('Kuponun süresi dolmuş');
    }
    if (subtotal < Number(coupon.min_order_amount)) {
      throw new BadRequestException(
        `Bu kupon için minimum sipariş tutarı ${Number(coupon.min_order_amount)} TL`,
      );
    }

    // Bu kullanıcı bu kuponu kaç kez kullandı? (iptal edilenler sayılmaz)
    const usageCount = await this.prisma.orders.count({
      where: {
        coupon_id: coupon.id,
        user_id: userId,
        status: { not: 'cancelled' },
      },
    });
    if (usageCount >= coupon.usage_limit_per_user) {
      throw new BadRequestException('Bu kuponu kullanma hakkınız kalmadı');
    }

    const discountValue = Number(coupon.discount_value);
    const discountAmount =
      coupon.discount_type === 'percentage'
        ? Math.min(subtotal, (subtotal * discountValue) / 100) // yüzde
        : Math.min(subtotal, discountValue); // sabit TL — ama sepetten fazla değil

    return { coupon, discountAmount };
  }
}
