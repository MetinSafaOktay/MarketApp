import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locales';

interface IsTranslatedTextOptions {
  /** true ise TR anahtarı zorunlu ve dolu olmalı. */
  requireDefault?: boolean;
  maxLength?: number;
}

/**
 * Çevrilebilir metin alanı doğrulaması:
 * - düz nesne olmalı
 * - anahtarlar yalnızca desteklenen dil kodları
 * - değerler boş olmayan string
 * - requireDefault ise `tr` anahtarı bulunmalı
 */
export function IsTranslatedText(
  options: IsTranslatedTextOptions = {},
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTranslatedText',
      target: object.constructor,
      propertyName,
      constraints: [options],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const opts = args.constraints[0] as IsTranslatedTextOptions;
          if (
            typeof value !== 'object' ||
            value === null ||
            Array.isArray(value)
          ) {
            return false;
          }
          const entries = Object.entries(value as Record<string, unknown>);
          for (const [key, val] of entries) {
            if (!(SUPPORTED_LOCALES as readonly string[]).includes(key)) {
              return false;
            }
            if (typeof val !== 'string' || val.trim().length === 0) {
              return false;
            }
            if (opts.maxLength && val.length > opts.maxLength) {
              return false;
            }
          }
          if (opts.requireDefault) {
            const def = (value as Record<string, unknown>)[DEFAULT_LOCALE];
            if (typeof def !== 'string' || def.trim().length === 0) {
              return false;
            }
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const opts = args.constraints[0] as IsTranslatedTextOptions;
          return opts.requireDefault
            ? `${args.property}: en az "tr" dili dolu olmalı, anahtarlar ${SUPPORTED_LOCALES.join('/')} ile sınırlı`
            : `${args.property}: geçersiz çok dilli metin (anahtarlar ${SUPPORTED_LOCALES.join('/')}, değerler boş olamaz)`;
        },
      },
    });
  };
}
