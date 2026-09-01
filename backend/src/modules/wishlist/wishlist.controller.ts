import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Lang } from '../../common/i18n/lang.decorator';
import type { Locale } from '../../common/i18n/locales';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@CurrentUser() currentUser: CurrentUserPayload, @Lang() lang: Locale) {
    return this.wishlistService.list(currentUser.userId, lang);
  }

  @Post('items')
  addItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: AddWishlistItemDto,
  ) {
    return this.wishlistService.addItem(currentUser.userId, dto);
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeItem(currentUser.userId, productId);
  }
}
