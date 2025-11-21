import { LocationForecastRequest, LocationForecastResponse } from '@app/shared/external-api/weather-api/weather-api.types';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WeatherApi } from '@shared/external-api/weather-api/weather-api.abstract';
import { InjectRepository } from '@nestjs/typeorm';
import { WeatherHourly } from './weather-hourly.entity';
import { Between, Repository } from 'typeorm';
import { Venue } from '@app/shared/entities';
import { Event } from '@app/events/event.entity';
import { WEATHER_FORECAST_DAYS_AHEAD } from '@app/shared/config/cache.config';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @Inject(WeatherApi) private readonly weatherApi: WeatherApi,

    @InjectRepository(WeatherHourly)
    private weatherHourlyRepository: Repository<WeatherHourly>,

    @InjectRepository(Venue)
    private venuesRepository: Repository<Venue>,

    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) { }

  async syncWeatherForVenue({ venueId, date }: {
    venueId: string;
    date: string;
  }) {
    const venue = await this.venuesRepository.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new Error(`Venue with id ${venueId} not found`);
    }

    const { latitude, longitude } = venue;

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingHourlyRecords = await this.weatherHourlyRepository.find({
      where: {
        venue: { id: venueId },
        timestampUtc: Between(startOfDay, endOfDay),
      },
    });

    // If one record exists, we assume all hours were updated at the same time
    if (existingHourlyRecords.length > 0) {
      const lastRefreshed = existingHourlyRecords[0].refreshedAt;
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (lastRefreshed > twentyFourHoursAgo) {
        return; // Fresh enough
      }
    }

    // Fetch from API
    const weatherForecast = await this.getHourlyForecast({
      date,
      latitude,
      longitude,
    });

    this.logger.log('fetched weather forecast for venue', venueId, 'on', date);

    const hourly = weatherForecast.hourly;

    if (!hourly || !hourly.time) return;

    const entitiesToSave: WeatherHourly[] = [];

    for (let i = 0; i < hourly.time.length; i++) {
      const timeStr = hourly.time[i];

      // Ensure UTC parsing. OpenMeteo returns "YYYY-MM-DDThh:mm" in GMT if not specified.
      const timestampUtc = new Date(`${timeStr}Z`);

      // Find existing record for this hour
      let weatherEntity = existingHourlyRecords.find(
        (r) => r.timestampUtc.getTime() === timestampUtc.getTime()
      );

      if (!weatherEntity) {
        weatherEntity = this.weatherHourlyRepository.create({
          venue: { id: venueId } as Venue, // Use partial venue object
          timestampUtc,
        });
      }

      // Update fields
      weatherEntity.precipitation = hourly.precipitation[i];
      weatherEntity.precipitationProbability = hourly.precipitation_probability[i];
      weatherEntity.rain = hourly.rain[i];
      weatherEntity.showers = hourly.showers[i];
      weatherEntity.snowfall = hourly.snowfall[i];
      weatherEntity.weatherCode = hourly.weather_code[i];
      weatherEntity.temperature2m = hourly.temperature_2m[i];
      weatherEntity.relativeHumidity2m = hourly.relative_humidity_2m[i];
      weatherEntity.dewPoint2m = hourly.dew_point_2m[i];
      weatherEntity.apparentTemperature = hourly.apparent_temperature[i];
      weatherEntity.windSpeed10m = hourly.wind_speed_10m[i];
      weatherEntity.refreshedAt = new Date();

      entitiesToSave.push(weatherEntity);
    }

    await this.weatherHourlyRepository.save(entitiesToSave);
  }

  private async getHourlyForecast(forecastRequest: LocationForecastRequest): Promise<LocationForecastResponse> {
    return this.weatherApi.getHourlyForecast(forecastRequest);
  }

  async syncUpcomingEventsWeather() {
    const upcomingEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .where('event.eventDateTime > NOW()')
      .andWhere(`event.eventDateTime < NOW() + INTERVAL '${WEATHER_FORECAST_DAYS_AHEAD} days'`)
      .andWhere('event.venueId IS NOT NULL')
      .getMany();

    for (const event of upcomingEvents) {
      if (event.venue && event.venue.id) {
        const eventDate = event.eventDateTime.toISOString().split('T')[0];
        await this.syncWeatherForVenue({
          venueId: event.venue.id,
          date: eventDate,
        });
      }
    }
  }

  async getWeatherForVenue(venueId: string, date: string): Promise<WeatherHourly[]> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return this.weatherHourlyRepository.find({
      where: {
        venue: { id: venueId },
        timestampUtc: Between(startOfDay, endOfDay),
      },
      order: {
        timestampUtc: 'ASC',
      },
    });
  }

  async getWeatherForVenueAt(venueId: string, datetimeUtc: Date): Promise<WeatherHourly | null> {
    const weatherAtDay = await this.getWeatherForVenue(venueId, datetimeUtc.toISOString().split('T')[0]);

    const weatherAtTime = weatherAtDay.find((weather) => {
      return weather.timestampUtc.getHours() === datetimeUtc.getHours();
    });

    return weatherAtTime || null;
  }
}
