/**
 * POST /auth/login gövdesi. email VEYA phone + password.
 * (Mobil istemci tek "identifier" alanı gösterir; `@` içeriyorsa email,
 * içermiyorsa phone olarak buraya gönderir.)
 */
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
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
  password: string;
}
