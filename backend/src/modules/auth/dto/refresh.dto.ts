/**
 * Hem POST /auth/refresh hem POST /auth/logout bu gövdeyi kullanır.
 * Alan adı camelCase (`refreshToken`) — DB'ye gitmiyor, sadece servise parametre.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
