import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Locale, parseAcceptLanguage, resolveLocale } from './locales';

/**
 * İstek dilini çözer: önce `?lang=` query, yoksa `Accept-Language` başlığı,
 * o da yoksa varsayılan (tr). Storefront controller'larında kullanılır.
 */
export const Lang = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Locale => {
    const req = ctx.switchToHttp().getRequest<{
      query?: Record<string, unknown>;
      headers?: Record<string, string | undefined>;
    }>();

    const queryLang = req.query?.lang;
    if (typeof queryLang === 'string' && queryLang.length > 0) {
      return resolveLocale(queryLang);
    }
    return parseAcceptLanguage(req.headers?.['accept-language']);
  },
);
