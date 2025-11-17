import { Inject, Injectable } from '@nestjs/common';
import { WeatherApi } from '@shared/external-api/weather-api/weather-api.abstract';

@Injectable()
export class WeatherService {
  // This service handles the logic for fetching and catching daily weather forecasts.
  // It uses the WeatherApi to fetch weather data and DailyVenueForecast entity.
  //
  // TODO: Define DTOs and types.

  constructor(@Inject(WeatherApi) private readonly weatherApi: WeatherApi) {}

  async getDailyForecast(): Promise<any> {
    return this.weatherApi.getWeatherForecast();
  }
}
