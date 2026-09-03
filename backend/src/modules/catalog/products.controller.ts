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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Lang } from '../../common/i18n/lang.decorator';
import type { Locale } from '../../common/i18n/locales';

/** `raw=true|1` → çok dilli alanları çözmeden ham jsonb map döndür (admin editör için). */
const isRaw = (v?: string) => v === 'true' || v === '1';

/**
 * /products — kataloğun kalbi.
 *  GET /              : arama + filtre + sıralama + sayfalama → { data, meta }
 *  GET /:id           : tek ürün (görselleriyle)
 *  GET /:id/similar   : aynı kategoriden birkaç öneri
 *  POST/PATCH/DELETE  : admin — ürün CRUD
 *  POST/DELETE /:id/images : ürün görseli ekle/çıkar (URL'ler storage modülünden gelir)
 */
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['tr', 'en', 'de', 'fr', 'ar', 'nl'],
  })
  @ApiQuery({
    name: 'raw',
    required: false,
    description: 'true → ham çok dilli map',
  })
  list(
    @Query() query: ListProductsQueryDto,
    @Lang() lang: Locale,
    @Query('raw') raw?: string,
  ) {
    return this.productsService.list(query, lang, isRaw(raw));
  }

  @Get(':id')
  @ApiQuery({ name: 'lang', required: false })
  @ApiQuery({ name: 'raw', required: false })
  findOne(
    @Param('id') id: string,
    @Lang() lang: Locale,
    @Query('raw') raw?: string,
  ) {
    return this.productsService.findOne(id, lang, isRaw(raw));
  }

  // Ürün detay sayfasındaki "Benzer ürünler" rafı. `limit` metin → sayı.
  @Get(':id/similar')
  listSimilar(
    @Param('id') id: string,
    @Lang() lang: Locale,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.listSimilar(
      id,
      lang,
      limit ? Number(limit) : undefined,
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/images')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  addImage(@Param('id') id: string, @Body() dto: AddProductImageDto) {
    return this.productsService.addImage(id, dto);
  }

  @Delete(':id/images/:imageId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.removeImage(id, imageId);
  }
}
