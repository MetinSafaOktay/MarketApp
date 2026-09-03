import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

/**
 * @Controller() prefix'siz — rotalar tam path veriyor (`conversations/...`).
 * `conversations/me*` → müşteri (kendi tek konuşması).
 * `conversations` + `conversations/:id*` → yalnızca admin (gelen kutusu + yanıt).
 */
@ApiTags('messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // İstemci bunu 5 sn'de bir çeker (polling). Yan etki: mağaza mesajlarını okundu yapar.
  @Get('conversations/me')
  getMyMessages(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.messagingService.getMyMessages(currentUser.userId);
  }

  @Post('conversations/me/messages')
  sendMyMessage(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMyMessage(currentUser.userId, dto);
  }

  @Get('conversations')
  @UseGuards(RolesGuard)
  @Roles('admin')
  listAllConversations() {
    return this.messagingService.listAllConversations();
  }

  @Get('conversations/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getConversationMessages(@Param('id') id: string) {
    return this.messagingService.getConversationMessages(id);
  }

  @Post('conversations/:id/messages')
  @UseGuards(RolesGuard)
  @Roles('admin')
  reply(@Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.messagingService.reply(id, dto);
  }
}
