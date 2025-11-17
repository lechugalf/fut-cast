export type GetWeatherForecastRequest = {
  latitude: number;
  longitude: number;
  date: string;
};

export abstract class WeatherApi {
  abstract getWeatherForecast(
    request?: GetWeatherForecastRequest,
  ): Promise<any[]> | void;
}
