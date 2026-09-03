/**
 * PATCH /users/me gövdesi. Tüm alanlar opsiyonel — yalnızca gönderilenler güncellenir
 * (kısmi güncelleme). `profile_photo_url` önce storage modülünden imzalı URL ile
 * Supabase'e yüklenip, dönen public URL burada gönderilir.
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  profile_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profile_photo_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_private?: boolean;
}
