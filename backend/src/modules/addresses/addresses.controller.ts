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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

/**
 * /addresses — sınıf düzeyindeki @UseGuards(JwtAuthGuard) sayesinde tüm uçlar
 * token ister. `:id` işlemlerinde sahiplik kontrolünü service yapar (başkasının
 * adresine PATCH/DELETE → 403).
 */
@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  list(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.addressesService.list(currentUser.userId);
  }

  @Post()
  create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.create(currentUser.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(currentUser.userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.addressesService.remove(currentUser.userId, id);
  }
}
