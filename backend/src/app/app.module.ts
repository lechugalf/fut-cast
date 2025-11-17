import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { ExternalApiModule } from '@shared/external-api/external-api.module';
import { WeatherModule } from './weather/weather.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@shared/database/database.module';
import { validate } from '@shared/config/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    ExternalApiModule,
    EventsModule,
    WeatherModule,
    AnalysisModule,
  ],
  //controllers: [EventsController],
  providers: [],
})
export class AppModule {}
