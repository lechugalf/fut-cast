import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventMapper } from './mappers/event.mapper';
import { EventDto } from './dto/event.dto';
import { EventDetailsDto } from './dto/event-details.dto';
import { LeagueDto } from './dto/league.dto';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Get('/events')
  async listEvents(@Query('leagueId') leagueId?: string): Promise<EventDto[]> {
    const events = await this.eventsService.getEvents(leagueId);
    return events.map(EventMapper.toDto);
  }

  @Get('/events/:id')
  async getEventsDetails(@Param('id') eventId: string): Promise<EventDetailsDto> {
    console.log('eventId', eventId);
    return this.eventsService.getEventDetails(eventId);
  }

  @Get('/leagues')
  async listLeagues(): Promise<LeagueDto[]> {
    return this.eventsService.getLeagues();
  }
}
