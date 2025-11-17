import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ExternalApiModule } from '@shared/external-api/external-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResult } from '../analysis/analysis-result.entity';

@Module({
  imports: [ExternalApiModule, TypeOrmModule.forFeature([AnalysisResult])],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
