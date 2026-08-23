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
