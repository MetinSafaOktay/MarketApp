/**
 * Uygulamanın tek Prisma istemcisi. `PrismaClient`'ı genişletir; her serviste
 * `constructor(private prisma: PrismaService)` ile enjekte edilir.
 * `@prisma/adapter-pg` (driver adapter) kullanır — eski query-engine ikilisi yerine;
 * serverless cold-start ve `dist/` çözümlemesi için tercih edildi.
 * Bağlantı yaşam döngüsü modül init/destroy'a bağlanır.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    // Local Postgres genelde TLS'siz; uzak DB'lerde (Supabase pooler) TLS zorunlu.
    // Supabase kendi CA'sını kullandığı için sertifika zinciri "self-signed" görünür,
    // bu yüzden rejectUnauthorized:false. Bağlantı yine de şifreli kurulur.
    const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(
      connectionString ?? '',
    );

    super({
      adapter: new PrismaPg({
        connectionString,
        ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
      }),
    });
  }

  async onModuleInit() {
    await this.$connect(); // uygulama açılırken havuz bağlantısını kur
  }

  async onModuleDestroy() {
    await this.$disconnect(); // kapanırken bağlantıları temiz bırak
  }
}
