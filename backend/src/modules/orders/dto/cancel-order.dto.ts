/** PATCH /orders/:id/cancel gövdesi — opsiyonel serbest metin iptal nedeni. */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelOrderDto {
  @ApiPropertyOptional({ description: 'İptal nedeni (opsiyonel)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
