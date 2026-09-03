/**
 * Ortam değişkeni şeması. `ConfigModule.forRoot({ validate: validateEnv })`
 * ile bağlanır; uygulama açılırken .env / process.env bu sınıfa göre denetlenir.
 * Zorunlu bir değişken eksik veya kuralı bozuksa uygulama HİÇ başlamaz
 * (yarı-yapılandırılmış prod'a çıkmayı önler).
 */
import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  Min,
  Max,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  // Postgres bağlantı dizesi. Local'de düz, prod'da Supabase transaction pooler.
  @IsString()
  DATABASE_URL: string;

  // Access token'ları imzalamak için kullanılan gizli anahtar. Kısa/zayıf secret
  // JWT'yi brute-force'a açar; en az 32 karakter zorunlu.
  @IsString()
  @MinLength(32, { message: 'JWT_SECRET en az 32 karakter olmalı' })
  JWT_SECRET: string;

  // Opsiyonel — verilmezse main.ts 3000'e düşer.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  // --- Aşağısı opsiyonel: yoksa ilgili özellik (web push / görsel yükleme) devre dışı ---

  @IsOptional()
  @IsString()
  VAPID_PUBLIC_KEY?: string;

  @IsOptional()
  @IsString()
  VAPID_PRIVATE_KEY?: string;

  @IsOptional()
  @IsString()
  VAPID_SUBJECT?: string;

  @IsOptional()
  @IsString()
  SUPABASE_URL?: string;

  @IsOptional()
  @IsString()
  SUPABASE_SERVICE_ROLE_KEY?: string;

  @IsOptional()
  @IsString()
  SUPABASE_STORAGE_BUCKET?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  // enableImplicitConversion: PORT gibi string env'leri hedef tipe ("number") çevir
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  // skipMissingProperties:false → zorunlu ama tanımsız alanlar da hata sayılır
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Ortam değişkenleri eksik/hatalı:\n${errors.toString()}`);
  }

  return validated;
}
