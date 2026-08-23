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
