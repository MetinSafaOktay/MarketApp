/**
 * POST /push/subscribe gövdesi — tarayıcının `PushSubscription` nesnesinden gelir:
 * `endpoint` (push servis URL'i) + `p256dh_key`/`auth_key` (şifreleme anahtarları).
 * Unsubscribe yalnızca `endpoint` gönderir.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubscribeDto {
  @ApiProperty()
  @IsString()
  endpoint: string;

  @ApiProperty()
  @IsString()
  p256dh_key: string;

  @ApiProperty()
  @IsString()
  auth_key: string;
}
