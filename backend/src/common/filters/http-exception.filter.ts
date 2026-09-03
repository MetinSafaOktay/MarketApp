/**
 * Global hata filtresi (main.ts'te bağlanır). Fırlatılan HER hatayı yakalar ve
 * istemciye tutarlı bir JSON gövde döndürür: { statusCode, path, timestamp, message }.
 * - HttpException (400/401/404...) → kendi status/mesajıyla geçer
 * - Beklenmeyen hata → 500 + generic mesaj (stack trace istemciye SIZMAZ, sadece loglanır)
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // parametresiz → tüm exception türlerini yakalar
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    // HttpException'ın gövdesi string ya da { message: ... } olabilir; ikisini de çöz
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message?: string | string[] }).message;

    // Yalnızca beklenmeyen (500) hataları logla — 400/404 gürültüsünü basma
    if (!isHttpException) {
      this.logger.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
