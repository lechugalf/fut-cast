import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenAI } from 'openai';
import { pRateLimit } from 'p-ratelimit';
import { EnvType } from '@app/shared/config/config.schema';
import { Event } from '../events/event.entity';
import { AnalysisResult } from './analysis-result.entity';
import { WeatherService } from '../weather/weather.service';
import { WeatherHourly } from '@app/weather/weather-hourly.entity';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly openai: OpenAI;
  private readonly limiter: <T>(fn: () => Promise<T>) => Promise<T>;

  constructor(
    private readonly configService: ConfigService<EnvType>,
    private readonly weatherService: WeatherService,

    @InjectRepository(AnalysisResult)
    private readonly analysisRepository: Repository<AnalysisResult>,

    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {
    const apiKey = this.configService.get('OPENROUTER_API_KEY');
    this.openai = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    const perMinute = pRateLimit({
      interval: 60 * 1000,
      rate: 20,
    });

    const perSecond = pRateLimit({
      interval: 1000,
      rate: 1,
    });

    this.limiter = (fn) => perSecond(() => perMinute(fn));
  }

  async generateAnalysisForUpcomingEvents() {
    const upcomingEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.homeTeam', 'homeTeam')
      .leftJoinAndSelect('event.awayTeam', 'awayTeam')
      .leftJoinAndSelect('event.analysisResult', 'analysisResult')
      .where('event.eventDateTime > NOW()')
      .andWhere('event.venueId IS NOT NULL')
      .getMany();

    this.logger.log(`Found ${upcomingEvents.length} upcoming events to check for analysis.`);

    for (const event of upcomingEvents) {
      if (!event.venue) continue;

      const eventDate = event.eventDateTime.toISOString().split('T')[0];

      const weatherData = await this.weatherService.getWeatherForVenue(
        event.venue.id,
        eventDate,
      );

      if (!weatherData || weatherData.length === 0) {
        this.logger.warn(
          `No weather forecast data found for event ${event.id}. Skipping analysis.`,
        );
        continue;
      }

      // Check if analysis needs to be generated or updated
      const needsAnalysis = !event.analysisResult;

      //Using weatherData[0] because any hour of the same day is updated at the same time
      const needsUpdate = event.analysisResult &&
        (!event.analysisResult.lastWeatherRefreshedAt ||
          event.analysisResult.lastWeatherRefreshedAt < weatherData[0].refreshedAt);

      if (needsAnalysis || needsUpdate) {
        await this.analyzeMatch(event, weatherData);
      }
    }

    this.logger.log('Analysis generation completed.');
  }

  async analyzeMatch(event: Event, weatherData: WeatherHourly[]) {
    const eventDate = event.eventDateTime.toISOString().split('T')[0];

    if (!event.venue || !weatherData || weatherData.length === 0) {
      this.logger.warn(
        `No weather data found for event ${event.id} at venue ${event.venue?.id} on ${eventDate}. Skipping analysis.`,
      );
      return;
    }

    // Taking the average or representative weather for the match time would be ideal,
    // but for now, let's take the weather at the event start hour.
    const eventHour = event.eventDateTime.getUTCHours();
    const weatherAtEvent = weatherData.find(
      (w) => w.timestampUtc.getUTCHours() === eventHour,
    ) || weatherData[0];

    const weatherSnapshot = `
      Temperatura: ${weatherAtEvent.temperature2m}°C
      Sensación Térmica: ${weatherAtEvent.apparentTemperature}°C
      Lluvia: ${weatherAtEvent.rain}mm
      Precipitación Probabilidad: ${weatherAtEvent.precipitationProbability}%
      Viento: ${weatherAtEvent.windSpeed10m}km/h
      Humedad: ${weatherAtEvent.relativeHumidity2m}%
      Código de clima: ${weatherAtEvent.weatherCode}
    `;

    const prompt = `
      Analiza el siguiente partido de fútbol basado en las condiciones climáticas y los equipos:
      Partido: ${event.homeTeam?.name} vs ${event.awayTeam?.name}
      Fecha: ${eventDate}
      Clima: ${weatherSnapshot}
      Location: ${event.venue.location || event.venue.country}

      Proporciona un análisis breve en español indicando cómo el clima podría afectar el juego y si favorece a algún equipo.
      Formato esperado:
      Análisis del Partido: [Equipos]
      [Análisis detallado]
    `;

    try {
      const model = this.configService.get('OPENROUTER_MODEL');
      const completion: any = await this.limiter(() =>
        this.openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Eres un experto analista de fútbol y meteorología. Tu objetivo es predecir cómo el clima afectará un partido.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      );

      const analysisText = completion.choices[0]?.message?.content;

      if (analysisText) {
        let analysisResult = await this.analysisRepository.findOne({
          where: { event: { id: event.id } },
        });

        if (!analysisResult) {
          analysisResult = this.analysisRepository.create({
            event,
          });
        }

        analysisResult.analysis = analysisText;
        analysisResult.prompt = prompt;
        analysisResult.weatherSnapshot = weatherSnapshot;
        analysisResult.lastWeatherRefreshedAt = weatherAtEvent.refreshedAt;
        analysisResult.refreshedAt = new Date();

        // TODO: parse favoredTeam from analysisText
        analysisResult.favoredTeam = null;
        analysisResult.asserted = null;

        await this.analysisRepository.save(analysisResult);
        this.logger.log(`Analysis generated for event ${event.id}`);
      }
    } catch (error) {
      this.logger.error(`Error generating analysis for event ${event.id}:`, error);
    }
  }
}
