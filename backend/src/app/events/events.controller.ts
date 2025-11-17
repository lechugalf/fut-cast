import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async listEvents(@Query('leagueId') leagueId: number): Promise<any[]> {
    return this.eventsService.getEvents(leagueId);
  }

  @Get('/:id')
  async getEventsDetails(@Param('id') eventId: number): Promise<any> {
    return this.eventsService.getEventsDetails(eventId);
  }
}
