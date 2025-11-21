import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ExternalApiModule } from '@shared/external-api/external-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResult } from '../analysis/analysis-result.entity';
import { WeatherHourly } from './weather-hourly.entity';
import { Venue } from '@app/shared/entities';
import { Event } from '@app/events/event.entity';

@Module({
  imports: [ExternalApiModule, TypeOrmModule.forFeature([AnalysisResult, WeatherHourly, Venue, Event])],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule { }
