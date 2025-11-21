import { League, Team, Venue } from '@app/shared/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalApiModule } from '@shared/external-api/external-api.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { WeatherModule } from '../weather/weather.module';
import { Event } from './event.entity';
import { EventsSyncService } from './events-sync.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, League, Venue, Team]),
    ExternalApiModule,
    WeatherModule,
    AnalysisModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsSyncService],
  exports: [EventsSyncService],
})
export class EventsModule { }
