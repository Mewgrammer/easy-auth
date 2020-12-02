import { LoggingMiddleware } from './logging.middleware';
import { Logger } from '@nestjs/common';

describe('LoggingMiddleware', () => {
  it('should be defined', () => {
    expect(new LoggingMiddleware(new Logger('LoggingMiddleWareTest'))).toBeDefined();
  });
  it('should throw TypeError on null request', () => {
    const mw = new LoggingMiddleware(new Logger('LoggingMiddleWareTest'));
    expect(() =>
      mw.use(null, null, () => {
        return null;
      }),
    ).toThrow(TypeError);
  });
});
