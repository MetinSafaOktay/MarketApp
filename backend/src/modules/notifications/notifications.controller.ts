import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

// /notifications — hepsi giriş ister, hep oturum sahibinin bildirimleri.
// Bildirim OLUŞTURMA uçları yok: bildirimleri yalnızca sistem (orders vb.) üretir.
@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  listMine(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.notificationsService.listMine(currentUser.userId);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markRead(currentUser.userId, id);
  }

  @Patch('me/read-all')
  markAllRead(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.notificationsService.markAllRead(currentUser.userId);
  }
}
