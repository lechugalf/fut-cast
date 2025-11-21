import { EnvType } from '@app/shared/config/config.schema';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pRateLimit } from 'p-ratelimit';

const DEFAULT_RATE_LIMIT_PER_MIN = 30;
const DEFAULT_RATE_LIMIT_PER_SEC = 2;

@Injectable()
export class SportsDbRateLimiterService {
  public limiter: <T>(fn: () => Promise<T>) => Promise<T>;

  constructor(private readonly configService: ConfigService<EnvType>) {
    const apiRateLimitPerMinute =
      this.configService.get('THESPORTSDB_RATE_LIMIT_PER_MIN') ||
      DEFAULT_RATE_LIMIT_PER_MIN;

    const apiRateLimitPerSecond =
      this.configService.get<number>('THESPORTSDB_RATE_LIMIT_PER_SEC') ||
      DEFAULT_RATE_LIMIT_PER_SEC;

    const perMinute = pRateLimit({
      interval: 60 * 1000,
      rate: apiRateLimitPerMinute,
    });

    const perSecond = pRateLimit({
      interval: 1000,
      rate: apiRateLimitPerSecond,
    });

    this.limiter = (fn) => perSecond(() => perMinute(fn));
  }
}
