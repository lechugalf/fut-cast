import { EventsSyncService } from '@app/events/events-sync.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EventsScheduler {
  private readonly logger = new Logger(EventsScheduler.name);

  constructor(private readonly eventSyncService: EventsSyncService) { }

  @Cron(CronExpression.EVERY_HOUR, { disabled: false })
  async pullUpcomingEvents() {
    try {
      this.logger.log('Starting upcoming events pull...');
      await this.eventSyncService.pullUpcomingEvents();
    } catch (error) {
      this.logger.error('Error pulling & syncing upcoming events:', error);
    }
  }
}
