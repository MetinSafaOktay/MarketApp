import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

/**
 * /users uçları.
 *  - `/users/me` (PATCH, DELETE): oturum sahibinin kendi hesabı — token gerekir
 *  - `/users/:id` (GET): herkese açık profil (guard yok)
 *  - `/users/:id/follow` (POST/DELETE): takip et / bırak — token gerekir
 * DİKKAT: `:id` route'ları en sonda; yoksa "me" bir id sanılırdı (Nest sırayla eşler).
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(currentUser.userId, dto);
  }

  // Yumuşak silme + anonimleştirme (bkz. service). 200 döner, kayıt fiziksel silinmez.
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteMe(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.usersService.deleteAccount(currentUser.userId);
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  @Post(':id/follow')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  follow(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.usersService.follow(currentUser.userId, id);
  }

  @Delete(':id/follow')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  unfollow(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.usersService.unfollow(currentUser.userId, id);
  }
}
