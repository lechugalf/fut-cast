import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event as EventEntity } from './event.entity';
import { Repository } from 'typeorm';
import { SportsApi } from '@app/shared/external-api/sports-api/sports-api.abstract';
import { AnalysisService } from '@app/analysis/analysis.service';

import {
  League as LeagueEntity,
  Team as TeamEntity,
  Venue,
} from '@app/shared/entities';


import { EnvType } from '@app/shared/config/config.schema';
import { ConfigService } from '@nestjs/config';
import { EventStatus } from './events.types';

const DEFAULT_UPCOMING_DAYS_LIMIT = 10;

/**
 * Service for syncing events data. (Handles writing operations)
 *
 * This service is responsible for fetching and syncing events data from external APIs.
 * It also gets weather data and triggers analysis predictions.
 */
@Injectable()
export class EventsSyncService {
  private upcomingDaysLimit: number;
  private logger = new Logger(EventsSyncService.name);

  constructor(
    private readonly configService: ConfigService<EnvType>,
    private readonly analysisService: AnalysisService,

    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,

    @InjectRepository(Venue)
    private venuesRepository: Repository<Venue>,

    @InjectRepository(LeagueEntity)
    private leaguesRepository: Repository<LeagueEntity>,

    @InjectRepository(TeamEntity)
    private teamsRepository: Repository<TeamEntity>,

    @Inject(SportsApi)
    private readonly sportsApi: SportsApi,
  ) {
    this.upcomingDaysLimit =
      this.configService.get('UPCOMING_DAYS_LIMIT') ||
      DEFAULT_UPCOMING_DAYS_LIMIT;
  }

  /**
   * Pull upcoming events and its related data (teams, venues) from external API and add them to the database.
   * It also gets weather data of the event day and trigger initial analysis predictions.
   * 
   * Will only pull events for a fixed number of days from the current time, defined in this.upcomingDaysLimit,
   * and that has not been cached yet.
   */
  async pullUpcomingEvents() {
    const leagueMap = new Map<
      string,
      {
        id: string;
        externalId: string;
        name: string;
        newerCachedEventId?: string;
        newerCachedEventDateTime?: Date;
      }
    >();

    const leagueIds = await this.leaguesRepository.find({
      select: ['id', 'externalId', 'name'],
    });

    if (!leagueIds.length) {
      throw new Error('No leagues found');
    }

    for (const league of leagueIds) {
      leagueMap.set(league.id, {
        id: league.id,
        externalId: league.externalId,
        name: league.name,
      });
    }

    const newerCachedEvent = await this.eventsRepository
      .createQueryBuilder('e')
      .select(['e.id', 'e.leagueId', 'e.eventDateTime'])
      .distinctOn(['e.leagueId'])
      .where('e.eventDateTime > NOW()')
      .orderBy('e.leagueId')
      .addOrderBy('e.eventDateTime', 'DESC')
      .getMany();

    for (const event of newerCachedEvent) {
      const leagueMapObj = leagueMap.get(event.leagueId);
      if (leagueMapObj) {
        leagueMapObj.newerCachedEventId = event.id;
        leagueMapObj.newerCachedEventDateTime = event.eventDateTime;
      }
    }

    for (const [, value] of leagueMap) {
      this.logger.log('fetching events for league:', value.name);
      const newerEventDateTime = value.newerCachedEventDateTime;
      const now = new Date();
      const fifteenDaysFromNow = new Date(
        now.getTime() + this.upcomingDaysLimit * 24 * 60 * 60 * 1000,
      );

      if (newerEventDateTime && newerEventDateTime > fifteenDaysFromNow) {
        continue;
      }

      const startPoint =
        newerEventDateTime && newerEventDateTime > now
          ? newerEventDateTime
          : now;

      const fetchEvents = await this.sportsApi.getUpcomingEvents({
        leagueId: value.externalId,
        leagueName: value.name,
        fromDate: startPoint,
        days: this.upcomingDaysLimit,
      });

      if (fetchEvents.length > 0) {
        this.logger.log('processing new events:', fetchEvents.length);

        for (const eventFromApi of fetchEvents) {
          if (
            !eventFromApi.externalHomeTeamId ||
            !eventFromApi.externalAwayTeamId
          ) {
            continue;
          }

          const leagueId = value.id;

          const homeTeamId = await this.pullTeam(
            eventFromApi.externalHomeTeamId,
            eventFromApi.externalHomeTeamName
          );

          const awayTeamId = await this.pullTeam(
            eventFromApi.externalAwayTeamId,
            eventFromApi.externalAwayTeamName
          );

          const venueId = eventFromApi.externalVenueId
            ? await this.pullVenue(eventFromApi.externalVenueId)
            : null;

          const nextRefreshAt = determineNextRefreshAt(eventFromApi.status, eventFromApi.eventDateTime);

          const newEvent = this.eventsRepository.create({
            externalId: eventFromApi.externalId,
            eventDateTime: eventFromApi.eventDateTime,
            status: eventFromApi.status,
            homeScore: eventFromApi.homeScore,
            awayScore: eventFromApi.awayScore,
            leagueId,
            homeTeamId,
            awayTeamId,
            venueId,
            refreshedAt: new Date(),
            nextRefreshAt,
            locked: !nextRefreshAt,
          });

          await this.eventsRepository.save(newEvent);
        }
      }
    }
  }

  /**
   * Refresh team data from external API and return its internal id.
   * 
   * Given SportsApi limitations, this method will only create the team with the external id and name,
   * provided by the fetched event.
   */
  private async pullTeam(externalTeamId: string, teamName: string): Promise<string> {
    const team = await this.teamsRepository.findOne({
      where: { externalId: externalTeamId },
    });

    if (team) {
      return team.id;
    }

    const newTeam = this.teamsRepository.create({
      externalId: externalTeamId,
      name: teamName,
      refreshedAt: new Date(),
    });

    await this.teamsRepository.save(newTeam);

    return newTeam.id;
  }

  /**
   * Fetch and create venue data from external API and return its internal id.
   */
  private async pullVenue(externalVenueId: string): Promise<string> {
    const venue = await this.venuesRepository.findOne({
      where: { externalId: externalVenueId },
    });

    if (venue) return venue.id;

    const findVenueResult = await this.sportsApi.getVenue(externalVenueId);

    if (!findVenueResult?.data) {
      // TODO: Handle with custom error
      throw new Error(`Venue not found: ${externalVenueId}`);
    }

    const venueFromApi = findVenueResult.data;

    const newVenue = this.venuesRepository.create({
      externalId: venueFromApi.externalId,
      thumbnailUrl: venueFromApi.strThumb,
      name: venueFromApi.name,
      country: venueFromApi.country,
      location: venueFromApi.location,
      rawTimezone: venueFromApi.rawTimezone,
      latitude: venueFromApi.coords.lat,
      longitude: venueFromApi.coords.lng,
    });
    await this.venuesRepository.save(newVenue);

    return newVenue.id;
  }



  // TODO: Implement fetchPastEvents method
  // Method to pull past events in case we need to fetch and cache previous events.
  // Find past N days events from the current time.
  // So first check if the last cached event is older than N days or not cached events yet.
  // Helpful for loading historical events from the database.
  async fetchPastEvents() {
    throw new Error("Not implemented");
  }

  // Query events WHERE next_refresh_at <= now() and AND locked = false
  // Calculate priorities using CASE WHEN (rules)
  // Sort results by priority DESC and limit to 20.
  async findRefreshEvents() { }

  // Refresh events by calling the sports API and updating the database.
  // Only updates status, locked, score and next_refresh_at
  // Updates weather and analysis for upcoming events if too old.
  // Update analysis accuracy for past events based in score.
  async refreshEvent() {
    // lookup event SportsApi
    // Update event status
    // Update event scores
    //
    // Weather update:
    //
    // If upcoming or live event
    // Find weather forecast using event datetime and location
    //    if weather forecast exists
    //       if older than 24 hrs, call WeatherService and update.
    //    else
    //       call WeatherService and create.
    //
    // Analysis Prediction update:
    //
    // Find analysis prediction using event id
    // If upcoming status
    //     If weather changed or didn't exists and was created successfully
    //     Or analysis didn't exists.
    //        Call analysis service and update
    // If past status
    //     If analysis exists
    //        Update analysis accuracy based on final score
  }
}


/**
 * Determines the next refresh time for an event based on its status and kickoff time.
 * 
 * This is important to get relevant data for each event at the right time.
 * and prioritize events that are closer to kickoff.
 * 
 * Stats and data can change over time, so it's important to refresh them
 * at the right time.
 * 
 * @param status 
 * @param kickoffAt 
 * @returns 
 */
const determineNextRefreshAt = (status: EventStatus, kickoffAt: Date) => {
  const now = new Date();
  const timeUntilKickoff = kickoffAt.getTime() - now.getTime();
  const hoursUntilKickoff = timeUntilKickoff / (1000 * 60 * 60);

  if (status === EventStatus.NOT_STARTED) {
    if (hoursUntilKickoff > 7 * 24) {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours
    } else if (hoursUntilKickoff > 24) {
      return new Date(now.getTime() + 12 * 60 * 60 * 1000); // +12 hours
    } else if (hoursUntilKickoff > 6) {
      return new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours
    } else if (hoursUntilKickoff > 2) {
      return new Date(now.getTime() + 1 * 60 * 60 * 1000); // +1 hour
    } else {
      return new Date(now.getTime() + 15 * 60 * 1000); // +15 minutes
    }
  }

  if (status === EventStatus.LIVE) {
    return new Date(now.getTime() + 5 * 60 * 1000); // +5 minutes
  }

  if (status === EventStatus.FINISHED) {
    const timeSinceKickoff = now.getTime() - kickoffAt.getTime();
    const hoursSinceKickoff = timeSinceKickoff / (1000 * 60 * 60);

    // partido puede tomar hasta 2 hrs de duracion (90 min + extras)
    const hoursSinceFinish = hoursSinceKickoff - 2;

    if (hoursSinceFinish < 1) {
      return new Date(now.getTime() + 5 * 60 * 1000); // +5 minutes
    } else if (hoursSinceFinish < 6) {
      return new Date(now.getTime() + 30 * 60 * 1000); // +30 minutes
    } else if (hoursSinceFinish < 24) {
      return new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours
    } else {
      return null;
    }
  }

  return null;
};