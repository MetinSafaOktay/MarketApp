/** Adres defteri CRUD + "bu adres bu kullanıcıya mı ait" güvenlik kontrolü. */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoreService } from '../store/store.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storeService: StoreService,
  ) {}

  /** Koordinat verilmişse ve mağaza teslimat bölgesi tanımlıysa: bölge dışıysa 422. */
  private async assertInDeliveryArea(lat?: number | null, lng?: number | null) {
    const check = await this.storeService.checkAddressInArea(lat, lng);
    if (!check.ok) {
      throw new UnprocessableEntityException(
        `Bu adres teslimat bölgemizin dışında (mağazaya en fazla ${check.radiusKm} km).`,
      );
    }
  }

  list(userId: string) {
    return this.prisma.addresses.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    });
  }

  async create(userId: string, dto: CreateAddressDto) {
    await this.assertInDeliveryArea(dto.latitude, dto.longitude);
    return this.prisma.addresses.create({
      data: { ...dto, user_id: userId },
    });
  }

  // update/remove'dan önce çağrılır: adres var mı VE çağırana mı ait?
  private async assertOwnership(userId: string, addressId: string) {
    const address = await this.prisma.addresses.findUnique({
      where: { id: addressId },
    });
    if (!address) throw new NotFoundException('Adres bulunamadı');
    if (address.user_id !== userId) {
      throw new ForbiddenException('Bu adres size ait değil');
    }
    return address;
  }

  async update(userId: string, addressId: string, dto: UpdateAddressDto) {
    const current = await this.assertOwnership(userId, addressId);
    // güncellemede yeni koordinat verildiyse onu, yoksa mevcut koordinatı kontrol et
    await this.assertInDeliveryArea(
      dto.latitude ?? current.latitude,
      dto.longitude ?? current.longitude,
    );
    return this.prisma.addresses.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async remove(userId: string, addressId: string) {
    await this.assertOwnership(userId, addressId);
    await this.prisma.addresses.delete({ where: { id: addressId } });
    return { success: true };
  }
}
