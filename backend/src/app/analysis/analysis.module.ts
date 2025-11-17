import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ExternalApiModule } from '@shared/external-api/external-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResult } from './analysis-result.entity';

@Module({
  imports: [ExternalApiModule, TypeOrmModule.forFeature([AnalysisResult])],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
