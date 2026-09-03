/** Kök controller'ın kullandığı önemsiz servis — sadece "ayakta" yanıtı üretir. */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
