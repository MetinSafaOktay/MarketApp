import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.store_profile.findFirst();
    if (existing) return existing;
    return this.prisma.store_profile.create({
      data: { name: 'MarketApp' },
    });
  }

  async update(dto: UpdateStoreDto) {
    const existing = await this.get();
    return this.prisma.store_profile.update({
      where: { id: existing.id },
      data: dto as Prisma.store_profileUpdateInput,
    });
  }
}
