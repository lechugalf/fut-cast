import { Inject, Injectable } from '@nestjs/common';
import { SportsApi } from '@shared/external-api/sports-api/sports-api.abstract';
import { WeatherService } from '../weather/weather.service';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class EventsService {
  // Main orchestration logic
  // Handle event details retrieval and event listing
  // Uses SportsApi and other services (WeatherService and AnalysisService) to
  // build event details and cache data from external sources into database

  constructor(
    @Inject(SportsApi) private readonly sportsApi: SportsApi,
    private readonly weatherService: WeatherService,
    private readonly analysisService: AnalysisService,
  ) {}

  async getEventsDetails(eventId: number): Promise<any> {
    console.log(eventId);

    await this.weatherService.getDailyForecast();
    this.analysisService.gamePredictionBasedOnWeather();

    // TODO: Implement logic
    return {};
  }

  getEvents(leagueId?: number): any[] {
    console.log(leagueId);
    // TODO: Implement
    return [];
  }
}
