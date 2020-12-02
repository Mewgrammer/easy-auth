import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private _logger: Logger) {}

  use(req: Request | any, res: Response, next: () => void) {
    this._logger.debug(`${req.ip}: ${req.method} ${req.url}`);
    next();
  }
}
