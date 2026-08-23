import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserSettingsService } from './user-settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('user-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me/settings')
export class UserSettingsController {
  constructor(private readonly settingsService: UserSettingsService) {}

  @Get()
  get(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.settingsService.get(currentUser.userId);
  }

  @Patch()
  update(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.update(currentUser.userId, dto);
  }
}
