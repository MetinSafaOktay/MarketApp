import { BadRequestException } from '@nestjs/common';
import { CouponsService } from './coupons.service';

type MockPrisma = {
  coupons: { findUnique: jest.Mock };
  orders: { count: jest.Mock };
};

function baseCoupon(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1',
    code: 'HOSGELDIN',
    is_active: true,
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    usage_limit_per_user: 1,
    valid_from: null,
    valid_until: null,
    ...overrides,
  };
}

describe('CouponsService.validateForOrder', () => {
  let prisma: MockPrisma;
  let service: CouponsService;

  beforeEach(() => {
    prisma = {
      coupons: { findUnique: jest.fn() },
      orders: { count: jest.fn().mockResolvedValue(0) },
    };
    service = new CouponsService(prisma as never);
  });

  it('rejects an unknown or inactive coupon', async () => {
    prisma.coupons.findUnique.mockResolvedValueOnce(null);
    await expect(service.validateForOrder('NOPE', 'u1', 100)).rejects.toThrow(
      BadRequestException,
    );

    prisma.coupons.findUnique.mockResolvedValueOnce(
      baseCoupon({ is_active: false }),
    );
    await expect(
      service.validateForOrder('HOSGELDIN', 'u1', 100),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a coupon that is not yet valid or already expired', async () => {
    prisma.coupons.findUnique.mockResolvedValueOnce(
      baseCoupon({ valid_from: new Date(Date.now() + 86_400_000) }),
    );
    await expect(
      service.validateForOrder('HOSGELDIN', 'u1', 100),
    ).rejects.toThrow('henüz geçerli değil');

    prisma.coupons.findUnique.mockResolvedValueOnce(
      baseCoupon({ valid_until: new Date(Date.now() - 86_400_000) }),
    );
    await expect(
      service.validateForOrder('HOSGELDIN', 'u1', 100),
    ).rejects.toThrow('süresi dolmuş');
  });

  it('enforces the minimum order amount', async () => {
    prisma.coupons.findUnique.mockResolvedValue(
      baseCoupon({ min_order_amount: 150 }),
    );
    await expect(
      service.validateForOrder('HOSGELDIN', 'u1', 100),
    ).rejects.toThrow('minimum sipariş tutarı');
  });

  it('enforces the per-user usage limit', async () => {
    prisma.coupons.findUnique.mockResolvedValue(baseCoupon());
    prisma.orders.count.mockResolvedValue(1);
    await expect(
      service.validateForOrder('HOSGELDIN', 'u1', 100),
    ).rejects.toThrow('kullanma hakkınız kalmadı');
  });

  it('computes a percentage discount', async () => {
    prisma.coupons.findUnique.mockResolvedValue(
      baseCoupon({ discount_type: 'percentage', discount_value: 20 }),
    );
    const { discountAmount } = await service.validateForOrder(
      'HOSGELDIN',
      'u1',
      250,
    );
    expect(discountAmount).toBe(50);
  });

  it('computes a fixed discount and never exceeds the subtotal', async () => {
    prisma.coupons.findUnique.mockResolvedValue(
      baseCoupon({ discount_type: 'fixed', discount_value: 40 }),
    );
    expect(
      (await service.validateForOrder('HOSGELDIN', 'u1', 250)).discountAmount,
    ).toBe(40);
    expect(
      (await service.validateForOrder('HOSGELDIN', 'u1', 30)).discountAmount,
    ).toBe(30);
  });
});
