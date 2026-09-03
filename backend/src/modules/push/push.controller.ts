import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PushService } from './push.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

// /push — tarayıcının PushManager aboneliğini (endpoint + anahtarlar) kaydeder/siler.
// Bir kullanıcının birden çok cihazı/tarayıcısı olabilir → birden çok abonelik.
@ApiTags('push')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  subscribe(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: SubscribeDto,
  ) {
    return this.pushService.subscribe(currentUser.userId, dto);
  }

  @Delete('subscribe')
  unsubscribe(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: Pick<SubscribeDto, 'endpoint'>,
  ) {
    return this.pushService.unsubscribe(currentUser.userId, dto.endpoint);
  }
}
