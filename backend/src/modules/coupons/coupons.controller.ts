import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * /coupons — sınıf düzeyindeki @Roles('admin') sayesinde TÜM uçlar admin.
 * Müşteri kupon uygulamayı bu uçlarla yapmaz; sepet/sipariş akışında kod gönderir.
 */
@ApiTags('coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  list() {
    return this.couponsService.list();
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
