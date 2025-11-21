import { TeamMapper } from './team.mapper';
import { League } from '../interfaces';
import { League as LeagueEntity } from '../entities/league.entity';

export class LeagueMapper {
  static toLeague(entity: LeagueEntity): League {
    const league: League = {
      id: entity.id,
      externalId: entity.externalId,
      name: entity.name,
      alternateName: entity.alternateName,
      logoImageUrl: entity.logoImageUrl,
      bannerImageUrl: entity.bannerImageUrl,
      badgeImageUrl: entity.badgeImageUrl,
    };

    if (entity.teams?.length) {
      league.teams = entity.teams.map((team) => TeamMapper.toTeam(team));
    }

    return league;
  }
}
