import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SportsApi } from './sports-api/sports-api.abstract';
import { TheSportsDBService } from './sports-api/thesportsdb/thesportsdb.service';
import { WeatherApi } from './weather-api/weather-api.abstract';
import { OpenMeteoService } from './weather-api/open-meteo.service';
import { SportsDbRateLimiterService } from './sports-api/thesportsdb/thesportsdb-rlimit.service';
import { OpenMeteoLimiterService } from './weather-api/open-meteo-rlimit.service';

@Module({
  imports: [HttpModule],
  providers: [
    { provide: SportsApi, useClass: TheSportsDBService },
    { provide: WeatherApi, useClass: OpenMeteoService },
    SportsDbRateLimiterService,
    OpenMeteoLimiterService,
  ],
  exports: [SportsApi, WeatherApi],
})
export class ExternalApiModule { }
