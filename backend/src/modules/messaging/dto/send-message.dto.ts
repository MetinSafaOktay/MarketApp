/**
 * Hem müşteri (`POST /conversations/me/messages`) hem admin
 * (`POST /conversations/:id/messages`) aynı gövdeyi kullanır — sadece metin.
 * `sender_type` gövdeden gelmez, endpoint'e göre service belirler.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;
}
