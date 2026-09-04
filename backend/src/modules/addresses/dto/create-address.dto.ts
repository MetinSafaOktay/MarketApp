/**
 * POST /addresses gövdesi. `label` = kullanıcının verdiği ad ("Ev", "İş").
 * `is_default` opsiyonel; verilmezse ilk adres pratikte varsayılan gibi kullanılır
 * (istemci ödeme ekranında varsayılanı önce seçer).
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

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

  // Haritadan seçilen konum (opsiyonel). İkisi de verilmezse teslimat bölgesi
  // kontrolü bu adres için uygulanamaz (serbest geçer).

  @ApiPropertyOptional({ description: 'Adres enlemi', example: 38.7601 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Adres boylamı', example: 30.5421 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
