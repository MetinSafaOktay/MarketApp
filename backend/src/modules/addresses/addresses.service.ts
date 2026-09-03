/** Adres defteri CRUD + "bu adres bu kullanıcıya mı ait" güvenlik kontrolü. */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.addresses.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    });
  }

  create(userId: string, dto: CreateAddressDto) {
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
    await this.assertOwnership(userId, addressId);
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
