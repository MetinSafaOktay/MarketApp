/**
 * Görsel yükleme. Backend dosyayı ALMAZ — Supabase Storage'a "imzalı upload URL"
 * üretir, istemci dosyayı doğrudan oraya PUT eder (serverless payload/süre limiti yok).
 * SUPABASE_* env yoksa uçlar 503 döner (uygulama yine çalışır).
 */
import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
