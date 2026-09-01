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
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutPreviewDto } from './dto/checkout-preview.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Lang } from '../../common/i18n/lang.decorator';
import type { Locale } from '../../common/i18n/locales';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  list(@CurrentUser() currentUser: CurrentUserPayload, @Lang() lang: Locale) {
    return this.cartService.list(currentUser.userId, lang);
  }

  @Post('items')
  addItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(currentUser.userId, dto);
  }

  @Patch('items/:productId')
  updateItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(currentUser.userId, productId, dto);
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(currentUser.userId, productId);
  }

  @Delete()
  clear(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.cartService.clear(currentUser.userId);
  }

  @Post('checkout-preview')
  @HttpCode(HttpStatus.OK)
  checkoutPreview(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CheckoutPreviewDto,
    @Lang() lang: Locale,
  ) {
    return this.cartService.checkoutPreview(currentUser.userId, dto, lang);
  }
}
