import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResult } from './analysis-result.entity';
import { WeatherModule } from '../weather/weather.module';
import { ExternalApiModule } from '@shared/external-api/external-api.module';
import { Event } from '../events/event.entity';

@Module({
  imports: [ExternalApiModule, TypeOrmModule.forFeature([AnalysisResult, Event]), WeatherModule],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule { }
