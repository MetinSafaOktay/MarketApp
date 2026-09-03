import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * /uploads — sınıfta JwtAuthGuard (giriş şart).
 * product-image: ekstra @Roles('admin') — ürün görselini sadece admin yükler.
 * avatar: her giriş yapmış kullanıcı kendi profil fotoğrafını yükleyebilir.
 * Prefix ('products'/'avatars') Supabase bucket içindeki klasörü belirler.
 */
@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('product-image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('admin')
  productImage(@Body() dto: CreateUploadUrlDto) {
    return this.storageService.createSignedUploadUrl('products', dto);
  }

  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  avatar(@Body() dto: CreateUploadUrlDto) {
    return this.storageService.createSignedUploadUrl('avatars', dto);
  }
}
