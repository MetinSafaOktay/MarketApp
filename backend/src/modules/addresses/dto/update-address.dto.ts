/**
 * PATCH /addresses/:id gövdesi. `PartialType` = CreateAddressDto'nun tüm alanlarını
 * opsiyonel yapar (kısmi güncelleme); doğrulama kuralları aynen miras alınır.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from './create-address.dto';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
