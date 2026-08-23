import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.cart_items.findMany({
      where: { user_id: userId },
      include: { products: { include: { product_images: true } } },
      orderBy: { added_at: 'desc' },
    });
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
}
