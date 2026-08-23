import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.wishlist_items.findMany({
      where: { user_id: userId },
      include: { products: { include: { product_images: true } } },
      orderBy: { added_at: 'desc' },
    });
  }

  async addItem(userId: string, dto: AddWishlistItemDto) {
    try {
      return await this.prisma.wishlist_items.create({
        data: { user_id: userId, product_id: dto.product_id },
      });
    } catch {
      throw new ConflictException('Ürün zaten istek listesinde');
    }
  }

  async removeItem(userId: string, productId: string) {
    await this.prisma.wishlist_items.deleteMany({
      where: { user_id: userId, product_id: productId },
    });
    return { success: true };
  }
}
