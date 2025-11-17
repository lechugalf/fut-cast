export abstract class SportsApi {
  abstract getEventsByLeague(leagueId: string): Promise<any[]>;
  abstract getEventById(eventId: string): Promise<any>;
}
