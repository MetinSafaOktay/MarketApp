/**
 * `@Roles(...)` ile işaretlenmiş route'larda kullanıcının rolünü kontrol eder.
 * Rolü JWT payload'ından okur (request.user.role) — DB'ye bakmaz; bu yüzden rol
 * değişikliği ancak yeni token alındığında (çıkış/giriş veya refresh) etkili olur.
 * JwtAuthGuard'dan SONRA çalışmalı (aksi halde request.user boş olur).
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { user_role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { CurrentUserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Route'ta (metot) veya controller'da (sınıf) tanımlı @Roles metadata'sını al
    const requiredRoles = this.reflector.getAllAndOverride<user_role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // @Roles yoksa bu guard bir şey dayatmaz (yalnızca giriş yeterli)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<{ user?: CurrentUserPayload }>();
    return requiredRoles.includes(request.user?.role as user_role);
  }
}
