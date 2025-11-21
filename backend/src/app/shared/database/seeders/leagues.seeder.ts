import { League } from '@app/shared/entities/league.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

const laLiga = {
  externalId: '4335',
  name: 'Spanish La Liga',
  alternateName: 'LaLiga Santander, La Liga',
  logoImageUrl:
    'https://r2.thesportsdb.com/images/media/league/logo/gq4b1r1687707889.png',
  bannerImageUrl:
    'https://r2.thesportsdb.com/images/media/league/banner/ua8q901726416940.jpg',
  badgeImageUrl:
    'https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png',
  teams: [],
};

const mls = {
  externalId: '4346',
  name: 'American Major League Soccer',
  alternateName: 'MLS',
  logoImageUrl:
    'https://r2.thesportsdb.com/images/media/league/logo/yrxxpx1421700436.png',
  bannerImageUrl:
    'https://r2.thesportsdb.com/images/media/league/banner/ycqd1a1557524672.jpg',
  badgeImageUrl:
    'https://r2.thesportsdb.com/images/media/league/badge/dqo6r91549878326.png',
  teams: [],
};

export default class LeagueSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(League);
    const leagues = [League.create(laLiga), League.create(mls)];
    await repository
      .createQueryBuilder()
      .insert()
      .into(League)
      .values(leagues)
      .orIgnore()
      .execute();
  }
}
