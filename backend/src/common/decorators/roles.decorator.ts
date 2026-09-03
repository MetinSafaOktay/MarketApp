/**
 * `@Roles('admin')` dekoratörü — bir route'un hangi rolleri gerektirdiğini
 * metadata olarak işaretler. RolesGuard bu metadata'yı Reflector ile okuyup
 * karşılaştırır. Tek başına koruma sağlamaz; `@UseGuards(JwtAuthGuard, RolesGuard)`
 * ile birlikte kullanılır.
 */
import { SetMetadata } from '@nestjs/common';
import { user_role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: user_role[]) => SetMetadata(ROLES_KEY, roles);
