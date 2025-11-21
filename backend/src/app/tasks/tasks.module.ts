import { Module } from '@nestjs/common';
import { EventsScheduler } from './events.scheduler';
import { WeatherScheduler } from './weather.scheduler';
import { AnalysisScheduler } from './analysis.scheduler';
import { EventsModule } from '@app/events/events.module';
import { WeatherModule } from '@app/weather/weather.module';
import { AnalysisModule } from '@app/analysis/analysis.module';

@Module({
  imports: [EventsModule, WeatherModule, AnalysisModule],
  providers: [EventsScheduler, WeatherScheduler, AnalysisScheduler],
  exports: [TasksModule],
})
export class TasksModule { }
