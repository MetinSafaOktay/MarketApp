/**
 * /admin/orders — mağazanın TÜM siparişleri (yalnızca admin). Müşteriye açık
 * /orders ucundan ayrı tutulur ki admin'in kişisel "Siparişlerim" listesine
 * başkalarının siparişleri karışmasın (bkz. OrdersService.list vs listAllForAdmin).
 * Durum güncelleme hâlâ PATCH /orders/:id/status üzerinden.
 */
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Lang } from '../../common/i18n/lang.decorator';
import type { Locale } from '../../common/i18n/locales';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/orders')
export class OrdersAdminController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Query() query: ListOrdersQueryDto, @Lang() lang: Locale) {
    return this.ordersService.listAllForAdmin(query.status, lang);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Lang() lang: Locale,
  ) {
    return this.ordersService.findOne(id, currentUser, lang);
  }
}
