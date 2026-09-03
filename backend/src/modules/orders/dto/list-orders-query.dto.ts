/**
 * GET /admin/orders sorgu parametreleri. `status` verilirse yalnızca o durumdaki
 * siparişler döner (admin panosunda sekme filtresi için).
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { order_status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListOrdersQueryDto {
  @ApiPropertyOptional({ enum: order_status })
  @IsOptional()
  @IsEnum(order_status)
  status?: order_status;
}
