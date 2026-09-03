/**
 * POST /auth/register gövdesi. Alan adları snake_case çünkü doğrudan
 * `prisma.users.create({ data: dto })` içine geçiyor (DB kolon adlarıyla birebir).
 * email/phone ikisi de opsiyonel görünse de servis "en az biri" kuralını uygular.
 */
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8) // minimum parola uzunluğu
  password: string;

  @ApiProperty({ maxLength: 30 })
  @IsString()
  @MaxLength(30)
  profile_name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  first_name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  last_name: string;
}
