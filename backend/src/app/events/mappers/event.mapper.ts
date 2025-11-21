import { LeagueMapper } from '@app/shared/mappers/league.mapper';
import { TeamMapper } from '@app/shared/mappers/team.mapper';
import { VenueMapper } from '@app/shared/mappers/venue.mapper';
import { Event as EventEntity } from '../event.entity';
import { Event, LoadedEvent } from '../interfaces/event.interface';
import { EventDto, VenueDto } from '../dto/event.dto';

export class EventMapper {
  static toEvent(entity: EventEntity): Event | LoadedEvent {
    const event: Event = {
      id: entity.id,
      externalId: entity.externalId,
      eventDateTime: entity.eventDateTime,
      status: entity.status,
      leagueId: entity.leagueId,
      homeTeamId: entity.homeTeamId,
      homeScore: entity.homeScore,
      awayTeamId: entity.awayTeamId,
      awayScore: entity.awayScore,
      venueId: entity.venueId,
    };

    if (
      entity.league?.id &&
      entity.homeTeam?.id &&
      entity.awayTeam?.id &&
      entity.venue?.id
    ) {
      const loadedEvent = event as LoadedEvent;
      loadedEvent.league = LeagueMapper.toLeague(entity.league);
      loadedEvent.homeTeam = TeamMapper.toTeam(entity.homeTeam);
      loadedEvent.awayTeam = TeamMapper.toTeam(entity.awayTeam);
      loadedEvent.venue = VenueMapper.toVenue(entity.venue);

      return event as LoadedEvent;
    }

    return event as Event;
  }

  static toDto(event: LoadedEvent): EventDto {

    const league = {
      id: event.league.id,
      name: event.league.name,
    }

    const homeTeam = {
      id: event.homeTeam.id,
      name: event.homeTeam.name,
    }

    const awayTeam = {
      id: event.awayTeam.id,
      name: event.awayTeam.name,
    }

    let venue: VenueDto | undefined;

    if (event.venue && event.venue.id) {
      venue = {
        id: event.venue.id,
        name: event.venue.name,
        location: event.venue.location,
        country: event.venue.country,
        coords: {
          lat: event.venue.coords.lat,
          lng: event.venue.coords.lng,
        }
      }
    }

    return {
      id: event.id,
      eventDateTime: event.eventDateTime,
      status: event.status,
      league,
      homeTeam,
      awayTeam,
      score: {
        homeTeamScore: event.homeScore,
        awayTeamScore: event.awayScore,
      },
      venue,
    };
  }
}
