import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WeatherService } from '@app/weather/weather.service';

@Injectable()
export class WeatherScheduler {
    private readonly logger = new Logger(WeatherScheduler.name);

    constructor(
        private readonly weatherService: WeatherService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE, { disabled: false })
    async syncWeather() {
        try {
            this.logger.log('Starting weather sync for upcoming events...');

            await this.weatherService.syncUpcomingEventsWeather();

            this.logger.log('Weather sync completed.');
        } catch (error) {
            this.logger.error('Error syncing weather:', error);
        }
    }
}
