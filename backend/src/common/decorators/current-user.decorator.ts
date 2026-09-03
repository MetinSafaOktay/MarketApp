/**
 * `@CurrentUser()` parametre dekoratörü. JwtAuthGuard doğrulama sonrası
 * `request.user`'a { userId, role } koyar; bu dekoratör onu controller
 * metoduna doğrudan enjekte eder: `me(@CurrentUser() u: CurrentUserPayload)`.
 * Yani guard'sız route'ta `undefined` döner — birlikte kullanılmalı.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  userId: string; // users.id (JWT'deki `sub`)
  role: string; // 'customer' | 'admin'
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: CurrentUserPayload }>();
    return request.user; // JwtStrategy.validate()'in döndürdüğü nesne
  },
);
