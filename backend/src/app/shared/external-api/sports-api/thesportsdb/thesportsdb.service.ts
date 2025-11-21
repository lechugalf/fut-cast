import { ExternalEvent } from '../interfaces/external-event.interface';
import { ExternalVenue } from '../interfaces/external-venue.interface';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ApiResource, SportsApi } from '../sports-api.abstract';
import { SportsDbRateLimiterService } from './thesportsdb-rlimit.service';
import { EventRawData, TeamRawData, VenueRawData } from './thesportsdb.types';
import {
  mapRawToEvent,
  mapRawToTeam,
  mapRawToVenue,
  normalizer,
} from './utils';
import { ConfigService } from '@nestjs/config';
import { EnvType } from '@app/shared/config/config.schema';
import { Team } from '@app/shared/interfaces/team.interface';
import { JsonObject } from '@app/shared/types';
import { Venue } from '@app/shared/interfaces';

const UPCOMING_SEARCH_MAX_DAYS = 30;

@Injectable()
export class TheSportsDBService implements SportsApi {
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvType>,
    private readonly rateLimiterService: SportsDbRateLimiterService,
  ) {
    const apiKey = this.configService.get<string>('THESPORTSDB_API_KEY');
    const apiUrl = this.configService.get<string>('THESPORTSDB_BASE_URL');

    if (!apiKey || !apiUrl) {
      throw new Error('Missing required configuration for SportsDB');
    }

    this.baseUrl = `${apiUrl}/${apiKey}`;
  }

  public async getUpcomingEvents({
    leagueId,
    leagueName,
    fromDate,
    days,
  }: {
    leagueId: string;
    leagueName: string;
    fromDate: Date;
    days: number;
  }) {
    if (days > UPCOMING_SEARCH_MAX_DAYS) {
      // TODO: Implement custom error
      throw new Error('Maximum days allowed is 30');
    }

    const nextEventResults = await this.into('events').fetch<EventRawData>(
      `eventsnextleague.php?id=${leagueId}`,
    );

    const nextEventRaw = nextEventResults.events[0];
    const nextEvent = mapRawToEvent(nextEventRaw);
    const startDate =
      nextEvent.eventDateTime >= fromDate ? nextEvent.eventDateTime : fromDate;

    const events: ExternalEvent[] = [];

    for (let dayCount = 1; dayCount <= days; dayCount++) {
      const queryDate = new Date(startDate);
      queryDate.setDate(queryDate.getDate() + dayCount);
      const queryDateStr = queryDate.toISOString().split('T')[0];

      const upcoming = await this.into('events').fetch<EventRawData>(
        `eventsday.php?d=${queryDateStr}&l=${leagueName}`,
      );

      events.push(...upcoming.events.map(mapRawToEvent));
    }

    return events;
  }

  public async getTeam(teamId: string) {
    const lookupTeamResult = await this.into('teams').fetch<TeamRawData>(
      `lookupteam.php?id=${teamId}`,
    );

    if (lookupTeamResult.teams.length === 0) {
      return null;
    }

    const teamRaw = lookupTeamResult.teams[0];
    const team = mapRawToTeam(teamRaw);

    return {
      data: team,
      externalId: team.externalId,
      rawData: teamRaw as unknown as JsonObject,
    };
  }

  public async getVenue(venueId: string): Promise<ApiResource<ExternalVenue> | null> {
    const lookupVenueResult = await this.into('venues').fetch<VenueRawData>(
      `lookupvenue.php?id=${venueId}`,
    );

    if (lookupVenueResult.venues.length === 0) {
      return null;
    }

    const venueRaw = lookupVenueResult.venues[0];
    const venue = mapRawToVenue(venueRaw);

    return {
      data: venue,
      externalId: venue.externalId,
      rawData: venueRaw as unknown as JsonObject,
    };
  }

  private async fetchRaw<T>(endpoint: string): Promise<T>;

  private async fetchRaw<T, K extends string = string>(
    endpoint: string,
    resourceName: K,
  ): Promise<{ [P in K]: T[] }>;

  private async fetchRaw<T, K extends string>(
    endpoint: string,
    resourceName?: K,
  ): Promise<T | { [P in K]: T[] }> {
    const url = `${this.baseUrl}/${endpoint}`;

    return this.rateLimiterService.limiter(async () => {
      try {
        console.log('fetching', resourceName, url);
        const response = await firstValueFrom(this.httpService.get(url));

        if (resourceName) {
          return normalizer(
            response.data as { [P in K]: T[] },
            resourceName,
          ) as { [P in K]: T[] };
        }

        return response.data as T;
      } catch (err) {
        console.log(url, err);
        // Use custom error
        throw new Error(
          `[SportsDB] Failed request: ${(err as Error)?.message}`,
        );
      }
    });
  }

  // Captures the 'resourceName' (K) and infers it strictly.
  // Returns an object with a fetch method that captures (T).
  private into<K extends string>(resourceName: K) {
    return {
      fetch: <T>(endpoint: string): Promise<{ [P in K]: T[] }> => {
        return this.fetchRaw<T, K>(endpoint, resourceName);
      },
    };
  }
}
