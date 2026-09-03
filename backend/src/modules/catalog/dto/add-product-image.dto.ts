/**
 * POST /products/:id/images gövdesi. `image_url` genelde önce storage modülünden
 * alınan imzalı URL ile Supabase'e yüklenir, dönen public URL buraya gönderilir.
 * `display_order` galeri sırasını belirler.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUrl, Min } from 'class-validator';

export class AddProductImageDto {
  @ApiProperty()
  @IsUrl()
  image_url: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;
}
