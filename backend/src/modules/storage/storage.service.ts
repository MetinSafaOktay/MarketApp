import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';

/**
 * Supabase Storage'a doğrudan (client -> Supabase) yükleme için imzalı URL üretir.
 * Dosya backend üzerinden geçmez; backend yalnızca kısa ömürlü upload token'ı verir.
 * SUPABASE_* ortam değişkenleri yoksa yükleme sessizce devre dışı kalır (503 döner).
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: SupabaseClient | null;
  private readonly bucket: string;
  private readonly baseUrl?: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.bucket =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ??
      'market-assets';
    this.baseUrl = url;

    if (url && serviceKey) {
      this.client = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } else {
      this.client = null;
      this.logger.warn(
        'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanımlı değil, görsel yükleme devre dışı',
      );
    }
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Akış: (1) istemci bu ucu çağırır → { upload_url, public_url } alır
   *       (2) istemci dosyayı upload_url'e PUT eder (Supabase'e doğrudan)
   *       (3) istemci public_url'i ürün/profil kaydına yazar (ayrı istek)
   */
  async createSignedUploadUrl(
    prefix: 'products' | 'avatars',
    dto: CreateUploadUrlDto,
  ) {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Görsel yükleme yapılandırılmamış (SUPABASE_* ortam değişkenleri eksik)',
      );
    }

    // Rastgele UUID isim → çakışma yok, tahmin edilemez
    const path = `${prefix}/${randomUUID()}.${dto.ext}`;
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      this.logger.error(`İmzalı upload URL üretilemedi: ${error?.message}`);
      throw new ServiceUnavailableException('Görsel yükleme başlatılamadı');
    }

    const { data: publicData } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(path);

    const uploadUrl = data.signedUrl.startsWith('http')
      ? data.signedUrl
      : `${this.baseUrl}/storage/v1${data.signedUrl}`;

    return {
      bucket: this.bucket,
      path: data.path,
      token: data.token,
      // Tam URL: client bu adrese PUT ile dosyayı yükler
      upload_url: uploadUrl,
      content_type: dto.content_type,
      // Yükleme bitince ürün/profil kaydında saklanacak kalıcı URL
      public_url: publicData.publicUrl,
    };
  }
}
