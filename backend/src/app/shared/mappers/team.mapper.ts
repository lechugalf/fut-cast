import { VenueMapper } from './venue.mapper';
import { Team } from '../interfaces';
import { Team as TeamEntity } from '../entities/team.entity';

export class TeamMapper {
  static toTeam(entity: TeamEntity): Team {
    const team: Team = {
      id: entity.id,
      externalId: entity.externalId,
      name: entity.name,
      alternateName: entity.alternateName,
      shortName: entity.shortName,
      logoImageUrl: entity.logoImageUrl,
      badgeImageUrl: entity.badgeImageUrl,
      venueId: entity.venue?.id,
    };

    if (entity.venue?.id) {
      team.venue = VenueMapper.toVenue(entity.venue);
    }

    return team;
  }
}
