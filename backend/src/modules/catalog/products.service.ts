import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductImageDto } from './dto/add-product-image.dto';

const WITH_IMAGES = {
  product_images: { orderBy: { display_order: 'asc' as const } },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  list(categoryId?: string) {
    return this.prisma.products.findMany({
      where: {
        is_active: true,
        ...(categoryId ? { category_id: categoryId } : {}),
      },
      include: WITH_IMAGES,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.products.findUnique({
      where: { id },
      include: WITH_IMAGES,
    });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    return product;
  }

  create(dto: CreateProductDto) {
    const { images, ...rest } = dto;
    return this.prisma.products.create({
      data: {
        ...rest,
        product_images: images
          ? { create: images.map((image_url) => ({ image_url })) }
          : undefined,
      },
      include: WITH_IMAGES,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.products.update({
      where: { id },
      data: dto,
      include: WITH_IMAGES,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.products.delete({ where: { id } });
    return { success: true };
  }

  async addImage(productId: string, dto: AddProductImageDto) {
    await this.findOne(productId);
    return this.prisma.product_images.create({
      data: { ...dto, product_id: productId },
    });
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.prisma.product_images.findUnique({
      where: { id: imageId },
    });
    if (!image || image.product_id !== productId) {
      throw new NotFoundException('Ürün görseli bulunamadı');
    }
    await this.prisma.product_images.delete({ where: { id: imageId } });
    return { success: true };
  }
}
