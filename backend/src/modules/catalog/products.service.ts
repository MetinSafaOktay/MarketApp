import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductImageDto } from './dto/add-product-image.dto';
import {
  ListProductsQueryDto,
  ProductSort,
} from './dto/list-products-query.dto';
import { paginate, toSkipTake } from '../../common/pagination';

const WITH_IMAGES = {
  product_images: { orderBy: { display_order: 'asc' as const } },
};

const SORT_MAP: Record<ProductSort, Prisma.productsOrderByWithRelationInput> = {
  newest: { created_at: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  name: { name: 'asc' },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProductsQueryDto) {
    const { skip, take, page, pageSize } = toSkipTake(
      query.page,
      query.pageSize,
    );

    const where: Prisma.productsWhereInput = {
      is_active: true,
      ...(query.categoryId ? { category_id: query.categoryId } : {}),
      ...(query.onlyNew ? { is_new_arrival: true } : {}),
      ...(query.inStock ? { stock_quantity: { gt: 0 } } : {}),
      ...(query.onlyDiscounted
        ? { original_price: { gt: this.prisma.products.fields.price } }
        : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { sku: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.products.findMany({
        where,
        include: WITH_IMAGES,
        orderBy: SORT_MAP[query.sort ?? 'newest'],
        skip,
        take,
      }),
      this.prisma.products.count({ where }),
    ]);

    return paginate(data, total, page, pageSize);
  }

  async listSimilar(id: string, limit = 8) {
    const product = await this.findOne(id);
    return this.prisma.products.findMany({
      where: {
        is_active: true,
        category_id: product.category_id,
        id: { not: id },
      },
      include: WITH_IMAGES,
      orderBy: { created_at: 'desc' },
      take: Math.min(24, Math.max(1, limit)),
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
