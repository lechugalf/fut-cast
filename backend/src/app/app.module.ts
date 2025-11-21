import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { ExternalApiModule } from '@shared/external-api/external-api.module';
import { WeatherModule } from './weather/weather.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@shared/database/database.module';
import { EnvType, validate } from '@shared/config/config.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { minutes, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvType>) => [
        {
          ttl: config.get('THROTTLE_TTL') as EnvType['THROTTLE_TTL'],
          limit: config.get('THROTTLE_LIMIT') as EnvType['THROTTLE_LIMIT'],
        }],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    ExternalApiModule,
    EventsModule,
    WeatherModule,
    AnalysisModule,
    TasksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
