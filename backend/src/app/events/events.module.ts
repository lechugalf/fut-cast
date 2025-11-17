import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { ExternalApiModule } from '@shared/external-api/external-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { WeatherModule } from '../weather/weather.module';
import { AnalysisModule } from '../analysis/analysis.module';

// TODO: WE MIGHT NEED THESE AS REPOSITORIES
//import { Team } from '@shared/entities/team.entity';
//import { Venue } from '@shared/entities/venue.entity';
//import { League } from '@shared/entities/league.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      //Team,
      //Venue,
      //League
    ]),
    ExternalApiModule,
    WeatherModule,
    AnalysisModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
