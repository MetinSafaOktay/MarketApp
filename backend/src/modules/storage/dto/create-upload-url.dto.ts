/**
 * POST /uploads/* gövdesi. Yalnızca dosya uzantısı + MIME tipi — dosyanın kendisi değil.
 * Beyaz liste ile sınırlı (jpg/png/webp); rastgele dosya türü yüklenemez.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export const ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'] as const;
export const ALLOWED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export class CreateUploadUrlDto {
  @ApiProperty({ enum: ALLOWED_IMAGE_EXTS })
  @IsIn(ALLOWED_IMAGE_EXTS)
  ext: (typeof ALLOWED_IMAGE_EXTS)[number];

  @ApiProperty({ enum: ALLOWED_IMAGE_MIME })
  @IsString()
  @IsIn(ALLOWED_IMAGE_MIME)
  content_type: (typeof ALLOWED_IMAGE_MIME)[number];
}
