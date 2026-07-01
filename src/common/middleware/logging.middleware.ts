import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();
        this.logger.log(`${req.method} ${req.originalUrl} - received`);
        res.on('finish', () => {
            this.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${(Date.now() - start) / 1000}s`);
        });
        next();
    }
}
