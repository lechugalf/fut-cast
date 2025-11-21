import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalysisService } from '@app/analysis/analysis.service';

@Injectable()
export class AnalysisScheduler {
    private readonly logger = new Logger(AnalysisScheduler.name);

    constructor(
        private readonly analysisService: AnalysisService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE, { disabled: false })
    async generateAnalysis() {
        try {
            this.logger.log('Starting analysis generation for upcoming events...');

            await this.analysisService.generateAnalysisForUpcomingEvents();

            this.logger.log('Analysis generation completed.');
        } catch (error) {
            this.logger.error('Error generating analysis:', error);
        }
    }
}
