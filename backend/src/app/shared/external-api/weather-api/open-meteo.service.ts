import { Injectable } from '@nestjs/common';
import { GetWeatherForecastRequest, WeatherApi } from './weather-api.abstract';

@Injectable()
export class OpenMeteoService implements WeatherApi {
  getWeatherForecast(request: GetWeatherForecastRequest) {
    // TODO: Implement method
    // Use openmeteo SDK
    console.log(request);
    return;
  }
}
