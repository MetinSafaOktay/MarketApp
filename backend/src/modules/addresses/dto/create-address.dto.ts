/**
 * POST /addresses gövdesi. `label` = kullanıcının verdiği ad ("Ev", "İş").
 * `is_default` opsiyonel; verilmezse ilk adres pratikte varsayılan gibi kullanılır
 * (istemci ödeme ekranında varsayılanı önce seçer).
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ maxLength: 50, example: 'Ev' })
  @IsString()
  @MaxLength(50)
  label: string;

  @ApiProperty()
  @IsString()
  full_address: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
