import { LocationForecastRequest, LocationForecastResponse } from "./weather-api.types";

export abstract class WeatherApi {
  abstract getHourlyForecast(
    request?: LocationForecastRequest,
  ): Promise<LocationForecastResponse>;
}
