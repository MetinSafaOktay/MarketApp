/**
 * PATCH /users/me/settings gövdesi — hepsi opsiyonel.
 * Not: mobil istemciler tema tercihini YEREL tutar (DataStore / @AppStorage),
 * bu yüzden pratikte sadece `push_/order_notifications_enabled` gönderilir.
 * `language` burada tr/en ile sınırlı (içerik i18n'i 6 dil; bu alan ayrı).
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'tr' })
  @IsOptional()
  @IsIn(['tr', 'en'])
  language?: string;

  @ApiPropertyOptional({ example: 'dark' })
  @IsOptional()
  @IsIn(['dark', 'light'])
  theme?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  push_notifications_enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  order_notifications_enabled?: boolean;
}
