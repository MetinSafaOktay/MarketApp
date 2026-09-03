/**
 * PrismaService'i @Global olarak yayınlar: bir kez AppModule'de import edilir,
 * sonra her modül ayrıca import etmeden `PrismaService` enjekte edebilir.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
