import { JsonObject } from '@app/shared/types';
import { ExternalEvent } from './interfaces/external-event.interface';
import { Venue } from '@app/shared/interfaces';
import { ExternalTeam } from './interfaces/external-team.interface';
import { ExternalVenue } from './interfaces/external-venue.interface';

export interface ApiResource<T> {
  data: T;
  externalId?: string;
  rawData?: JsonObject;
}

export abstract class SportsApi {
  abstract getUpcomingEvents(args: {
    leagueId: string;
    leagueName: string;
    fromDate: Date;
    days: number;
  }): Promise<ExternalEvent[]>;

  abstract getTeam(teamId: string): Promise<ApiResource<ExternalTeam> | null>;

  abstract getVenue(venueId: string): Promise<ApiResource<ExternalVenue> | null>;

  //abstract getEventsByLeague(
  //   leagueId: string,
  //): AsyncSportApiResponse<EventDto[]>;
  //abstract getEventById(eventId: string): AsyncSportApiResponse<EventDto>;

  //abstract getVenueById(venueId: string): AsyncSportApiResponse<VenueDto>;
  //abstract getLeagueById(leagueId: string): AsyncSportApiResponse<LeagueDto>;
}
