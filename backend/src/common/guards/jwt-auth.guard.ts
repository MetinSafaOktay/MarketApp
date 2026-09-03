/**
 * `@UseGuards(JwtAuthGuard)` → route'a girmeden önce Authorization: Bearer <token>
 * başlığını doğrular. Doğrulamayı JwtStrategy ('jwt' adıyla kayıtlı) yapar;
 * geçerliyse strateji sonucunu `request.user`'a yazar, geçersiz/süresi dolmuşsa 401.
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
