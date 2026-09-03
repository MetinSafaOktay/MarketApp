import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { payment_method } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * POST /orders gövdesi. İstemci sepeti değil, satın alınacak `items` listesini
 * gönderir (istemci sepetten türetir). `payment_method` yoksa "kapıda nakit".
 * Fiyatlar burada YOK — server sipariş anındaki ürün fiyatını baz alır (manipülasyon önlenir).
 */

// Nested doğrulama: `@ValidateNested({ each: true })` + `@Type` gerekli
export class OrderItemInputDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  address_id: string;

  @ApiProperty({ type: [OrderItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coupon_code?: string;

  @ApiPropertyOptional({ enum: payment_method, default: 'cash_on_delivery' })
  @IsOptional()
  @IsEnum(payment_method)
  payment_method?: payment_method;
}
