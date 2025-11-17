import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SportsApi } from './sports-api/sports-api.abstract';
import { SportsDBService } from './sports-api/sportsdb.service';
import { WeatherApi } from './weather-api/weather-api.abstract';
import { OpenMeteoService } from './weather-api/open-meteo.service';

@Module({
  imports: [HttpModule],
  providers: [
    { provide: SportsApi, useClass: SportsDBService },
    { provide: WeatherApi, useClass: OpenMeteoService },
  ],
  exports: [SportsApi, WeatherApi],
})
export class ExternalApiModule {}
