import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Lang } from '../../common/i18n/lang.decorator';
import type { Locale } from '../../common/i18n/locales';

// Sınıf düzeyinde @Roles('admin') → tüm /admin/* uçları yalnızca admin.
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  stats() {
    return this.adminService.stats();
  }

  @Get('customers')
  listCustomers(@Query() query: ListCustomersQueryDto) {
    return this.adminService.listCustomers(query);
  }

  @Get('products/low-stock')
  lowStock(@Lang() lang: Locale, @Query('threshold') threshold?: string) {
    return this.adminService.lowStockProducts(
      threshold ? Number(threshold) : undefined,
      lang,
    );
  }
}
