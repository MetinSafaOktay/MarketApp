import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Lang } from '../../common/i18n/lang.decorator';
import type { Locale } from '../../common/i18n/locales';

const isRaw = (v?: string) => v === 'true' || v === '1';

// GET'ler herkese açık (storefront); POST/PATCH/DELETE metot bazında @Roles('admin').
// create'te @CurrentUser yazarı (author_id) belirlemek için gerekli.
@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiQuery({ name: 'lang', required: false })
  @ApiQuery({ name: 'raw', required: false })
  list(@Lang() lang: Locale, @Query('raw') raw?: string) {
    return this.announcementsService.list(lang, isRaw(raw));
  }

  @Get(':id')
  @ApiQuery({ name: 'lang', required: false })
  @ApiQuery({ name: 'raw', required: false })
  findOne(
    @Param('id') id: string,
    @Lang() lang: Locale,
    @Query('raw') raw?: string,
  ) {
    return this.announcementsService.findOne(id, lang, isRaw(raw));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.announcementsService.create(currentUser.userId, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
