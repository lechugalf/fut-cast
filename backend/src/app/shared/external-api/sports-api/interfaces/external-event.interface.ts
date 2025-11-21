import { EventStatus } from '@app/events/events.types';

export interface ExternalEvent {
    externalId: string;
    eventDateTime: Date;
    status: EventStatus;

    // External ids for relationships
    externalLeagueId: string;
    externalHomeTeamId: string;
    externalHomeTeamName: string;
    externalAwayTeamId: string;
    externalAwayTeamName: string;
    externalVenueId: string | null;

    homeScore: number | null;
    awayScore: number | null;
}
