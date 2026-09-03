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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Lang } from '../../common/i18n/lang.decorator';
import type { Locale } from '../../common/i18n/locales';

const isRaw = (v?: string) => v === 'true' || v === '1';

/**
 * /categories — GET'ler herkese açık (storefront kategori menüsü / ızgarası).
 * POST/PATCH/DELETE yalnızca admin. `raw=true` → çok dilli ham map (admin editörü).
 */
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiQuery({ name: 'lang', required: false })
  @ApiQuery({ name: 'raw', required: false })
  list(@Lang() lang: Locale, @Query('raw') raw?: string) {
    return this.categoriesService.list(lang, isRaw(raw));
  }

  @Get(':id')
  @ApiQuery({ name: 'lang', required: false })
  @ApiQuery({ name: 'raw', required: false })
  findOne(
    @Param('id') id: string,
    @Lang() lang: Locale,
    @Query('raw') raw?: string,
  ) {
    return this.categoriesService.findOne(id, lang, isRaw(raw));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
