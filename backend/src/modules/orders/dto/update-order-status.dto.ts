/**
 * PATCH /orders/:id/status gövdesi (admin). `status` = order_status enum
 * (pending/confirmed/preparing/out_for_delivery/delivered/cancelled).
 * `note` opsiyonel — zaman çizelgesinde ve müşteri bildiriminde görünür.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { order_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: order_status })
  @IsEnum(order_status)
  status: order_status;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
