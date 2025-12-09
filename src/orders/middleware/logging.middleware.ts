import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class OrdersLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('OrdersAPI');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const userAgent = req.get('User-Agent') || '';
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - start;

      this.logger.log(
        `${method} ${originalUrl} - ${statusCode} - ${responseTime}ms - ${userAgent}`,
      );

      if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
        this.logger.log(`Request Body: ${JSON.stringify(body)}`);
      }
    });

    next();
  }
}
