import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppLoggerService } from '../services/authLogger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { originalUrl, method } = req;
    const start: number = Date.now();

    this.logger.log(`${method} ${originalUrl}`, 'RequestLogger');

    res.on('finish', (): void => {
      const { statusCode } = res;
      const delay: number = Date.now() - start;
      this.logger.log(
        `${originalUrl} ${statusCode} - ${delay}ms`,
        'ResponseLogger',
      );
    });

    next();
  }
}
