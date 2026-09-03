import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Lang } from '../../common/i18n/lang.decorator';
import type { Locale } from '../../common/i18n/locales';

// query string'de her şey metin: "?raw=true" / "?raw=1" → boolean
const isRaw = (v?: string) => v === 'true' || v === '1';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // GET herkese açık. raw=false → çok dilli alanlar tek dile çözülür (storefront);
  // raw=true → ham { tr, en, ... } map'i döner (admin çeviri editörü için).
  @Get()
  @ApiQuery({ name: 'lang', required: false })
  @ApiQuery({ name: 'raw', required: false })
  get(@Lang() lang: Locale, @Query('raw') raw?: string) {
    return this.storeService.get(lang, isRaw(raw));
  }

  // PATCH: yalnızca admin. İki guard sırayla — önce giriş (JwtAuthGuard), sonra rol.
  @Patch()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Body() dto: UpdateStoreDto) {
    return this.storeService.update(dto);
  }
}
