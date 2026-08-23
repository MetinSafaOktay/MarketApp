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
