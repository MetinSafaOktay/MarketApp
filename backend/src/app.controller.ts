/**
 * Kök controller — herhangi bir domaine ait olmayan iki uç:
 *  GET /        : basit "ayakta mı" yanıtı
 *  GET /health  : DB'ye SELECT 1 atarak bağlantıyı da doğrular.
 * `/health` ayrıca Vercel cron'u tarafından günde bir çağrılır; bu sorgu
 * Supabase free-tier projesini ~7 günlük hareketsizlik uykusundan uyanık tutar.
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    await this.prisma.$queryRaw`SELECT 1`; // DB gerçekten yanıt veriyor mu?
    return { status: 'ok', database: 'connected' };
  }
}
