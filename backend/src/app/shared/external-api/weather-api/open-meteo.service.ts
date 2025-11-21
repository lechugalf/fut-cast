import { Injectable } from '@nestjs/common';
import { WeatherApi } from './weather-api.abstract';
import { OpenMeteoLimiterService } from './open-meteo-rlimit.service';
import { HttpService } from '@nestjs/axios';
import { EnvType } from '@app/shared/config/config.schema';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { WeatherVariable } from './utils';
import { LocationForecastRequest, LocationForecastResponse } from './weather-api.types';

@Injectable()
export class OpenMeteoService implements WeatherApi {
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvType>,
    private readonly openMeteoLimiterService: OpenMeteoLimiterService
  ) {

    const apiUrl = this.configService.get<string>('OPENMETEO_BASE_URL');

    if (!apiUrl) {
      throw new Error('Missing required configuration for OpenMeteo');
    }

    this.baseUrl = apiUrl;
  }

  async getHourlyForecast({ date, latitude, longitude }: LocationForecastRequest): Promise<LocationForecastResponse> {
    const url = `${this.baseUrl}/forecast`;

    const watherVariables = [
      WeatherVariable.Precipitation,
      WeatherVariable.PrecipitationProbability,
      WeatherVariable.Rain,
      WeatherVariable.Showers,
      WeatherVariable.Snowfall,
      WeatherVariable.WeatherCode,
      WeatherVariable.Temperature2m,
      WeatherVariable.RelativeHumidity2m,
      WeatherVariable.DewPoint2m,
      WeatherVariable.ApparentTemperature,
      WeatherVariable.WindSpeed10m,
    ]

    return this.openMeteoLimiterService.limiter(async () => {

      try {
        const response = await firstValueFrom(
          this.httpService.get(url, {
            params: {
              latitude,
              longitude,
              hourly: watherVariables.join(','),
              start_date: date,
              end_date: date,
            },
          }),
        );

        return response.data;
      } catch (err) {
        throw new Error(
          `[OpenMeteo] Failed request: ${(err as Error)?.message}`,
        );
      }
    });


  }
}
