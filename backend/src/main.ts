/**
 * Uygulama giriş noktası. NestFactory ile AppModule'den bir HTTP sunucusu kurar
 * ve global ara katmanları (güvenlik başlıkları, CORS, doğrulama, hata filtresi)
 * ve Swagger dokümanını bağlar. `npm run start:dev` / Vercel bunu çalıştırır.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet()); // güvenlik odaklı HTTP başlıkları (XSS, sniffing, clickjacking...)
  app.enableCors(); // tüm origin'lere açık — web istemcisi farklı domain'den çağırıyor

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO'da tanımlı olmayan alanları gövdeden ayıkla
      forbidNonWhitelisted: true, // fazladan alan varsa 400 döndür
      transform: true, // gelen düz JSON'u DTO sınıf örneğine + tiplerine çevir
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter()); // tüm hataları tek tip JSON'a çevirir

  // Swagger UI /api adresinde; ham şema /api-json (export:openapi bunu çeker).
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Erenler Market API')
    .setDescription('Erenler Market backend API dokümantasyonu')
    .setVersion('0.1.0')
    .addBearerAuth() // "Authorize" düğmesi: Bearer JWT
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
