import { EventDto, TeamDto } from "./event.dto";

export type WeatherHourlyDto = {
  timestampUtc: Date;
  temperature2m: number | null;
  apparentTemperature: number | null;
  rain: number | null;
  precipitationProbability: number | null;
  windSpeed10m: number | null;
  relativeHumidity2m: number | null;
  weatherCode: number | null;
};

export type AnalysisDto = {
  id: string;
  analysis: string;
  weatherSnapshot: string;
  favoredTeam?: TeamDto | null;
  asserted: boolean | null;
  refreshedAt: Date;
  lastWeatherRefreshedAt: Date | null;
};

export interface EventDetailsDto extends EventDto {
  weather?: WeatherHourlyDto;
  analysis?: AnalysisDto;
}
