import { Injectable, NotFoundException } from '@nestjs/common';
import { Event, LoadedEvent } from './interfaces/event.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Event as EventEntity } from './event.entity';
import { Repository } from 'typeorm';
import { EventMapper } from './mappers/event.mapper';
import { WeatherService } from '@app/weather/weather.service';
import { EventDetailsDto } from './dto/event-details.dto';
import { League } from '@app/shared/entities/league.entity';
import { LeagueDto } from './dto/league.dto';

@Injectable()
export class EventsService {
  // Data read operations (Queries)

  constructor(
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,

    @InjectRepository(League)
    private leagueRepository: Repository<League>,

    private readonly weatherService: WeatherService,
  ) { }

  async getEvents(leagueId?: string): Promise<LoadedEvent[]> {
    let where = {};

    if (leagueId) {
      where = { where: { league: { id: leagueId } } };
    }

    const events = await this.eventsRepository.find({
      ...where,
      order: { eventDateTime: 'ASC' },
      relations: ['league', 'homeTeam', 'awayTeam', 'venue'],
    });

    return events.map((event) => EventMapper.toEvent(event) as LoadedEvent);
  }

  async getEventDetails(eventId: string): Promise<EventDetailsDto> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['league', 'homeTeam', 'awayTeam', 'venue', 'analysisResult', 'analysisResult.favoredTeam'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const baseEvent = EventMapper.toEvent(event) as LoadedEvent;
    const eventDto = EventMapper.toDto(baseEvent);

    let weatherData: EventDetailsDto['weather'] = undefined;
    if (event.venue) {
      const weatherHourly = await this.weatherService.getWeatherForVenueAt(
        event.venue.id,
        event.eventDateTime,
      );

      if (weatherHourly) {
        weatherData = {
          timestampUtc: weatherHourly.timestampUtc,
          temperature2m: weatherHourly.temperature2m,
          apparentTemperature: weatherHourly.apparentTemperature,
          rain: weatherHourly.rain,
          precipitationProbability: weatherHourly.precipitationProbability,
          windSpeed10m: weatherHourly.windSpeed10m,
          relativeHumidity2m: weatherHourly.relativeHumidity2m,
          weatherCode: weatherHourly.weatherCode,
        };
      }
    }

    let analysisData: EventDetailsDto['analysis'] = undefined;
    if (event.analysisResult) {
      analysisData = {
        id: event.analysisResult.id,
        analysis: event.analysisResult.analysis,
        weatherSnapshot: event.analysisResult.weatherSnapshot,
        favoredTeam: event.analysisResult.favoredTeam
          ? {
            id: event.analysisResult.favoredTeam.id,
            name: event.analysisResult.favoredTeam.name,
          }
          : null,
        asserted: event.analysisResult.asserted,
        refreshedAt: event.analysisResult.refreshedAt,
        lastWeatherRefreshedAt: event.analysisResult.lastWeatherRefreshedAt,
      };
    }

    return {
      ...eventDto,
      weather: weatherData,
      analysis: analysisData,
    };
  }

  async getLeagues(): Promise<LeagueDto[]> {
    const leagues = await this.leagueRepository.find({
      order: { name: 'ASC' },
    });

    return leagues.map((league) => ({
      id: league.id,
      name: league.name,
      alternateName: league.alternateName,
      logoImageUrl: league.logoImageUrl,
      bannerImageUrl: league.bannerImageUrl,
      badgeImageUrl: league.badgeImageUrl,
    }));
  }
}
