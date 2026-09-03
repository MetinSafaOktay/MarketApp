import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Lang } from '../../common/i18n/lang.decorator';
import type { Locale } from '../../common/i18n/locales';

/**
 * /orders — sınıf düzeyinde JwtAuthGuard (giriş şart). list/findOne'da müşteri
 * yalnızca KENDİ siparişini görür, admin hepsini (kontrol service'te, currentUser
 * hem id hem role taşıyor). `/:id/status` ekstra RolesGuard ile sadece admin.
 */
@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Sepetten değil, istemcinin gönderdiği items listesinden sipariş kurar.
  @Post()
  create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateOrderDto,
    @Lang() lang: Locale,
  ) {
    return this.ordersService.create(currentUser.userId, dto, lang);
  }

  @Get()
  list(@CurrentUser() currentUser: CurrentUserPayload, @Lang() lang: Locale) {
    return this.ordersService.list(currentUser, lang);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Lang() lang: Locale,
  ) {
    return this.ordersService.findOne(id, currentUser, lang);
  }

  // Müşteri iptali — yalnızca hazırlığa başlanmadan (pending/confirmed). Stok iade edilir.
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @Lang() lang: Locale,
  ) {
    return this.ordersService.cancel(id, currentUser, dto, lang);
  }

  // Admin: siparişi bir sonraki duruma taşı (onaylandı → hazırlanıyor → yolda → teslim)
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateStatus(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Lang() lang: Locale,
  ) {
    return this.ordersService.updateStatus(id, currentUser.userId, dto, lang);
  }
}
