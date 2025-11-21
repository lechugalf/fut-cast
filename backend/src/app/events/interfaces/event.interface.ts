import { League, Team, Venue } from '@app/shared/interfaces';
import { EventStatus } from '../events.types';

export interface Event {
  id: string;
  externalId: string;
  eventDateTime: Date;
  status: EventStatus;

  // League
  leagueId: string;

  // Home team
  homeTeamId: string | null;
  homeScore: number | null;

  // Away team
  awayTeamId: string | null;
  awayScore: number | null;

  // Venue
  venueId: string | null;
}

export interface LoadedEvent extends Event {
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
}
