import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';
import { Team } from './team.entity';
import { League as LeagueInterface } from '../interfaces';

@Entity()
export class League {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id: string = ulid();

  @Column({ unique: true })
  externalId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  alternateName: string;

  @Column({ type: 'text' })
  logoImageUrl: string;

  @Column({ type: 'text' })
  bannerImageUrl: string;

  @Column({ type: 'text' })
  badgeImageUrl: string;

  @ManyToMany(() => Team, { nullable: true })
  teams: Team[] | null;

  @Column({ type: 'timestamptz' })
  createdAt: Date = new Date();

  static create(data: LeagueInterface | Omit<LeagueInterface, 'id'>) {
    const league = new League();

    league.id = 'id' in data ? data.id : ulid();
    league.externalId = data.externalId;
    league.name = data.name;
    league.alternateName = data.alternateName;
    league.logoImageUrl = data.logoImageUrl;
    league.bannerImageUrl = data.bannerImageUrl;
    league.badgeImageUrl = data.badgeImageUrl;

    return league;
  }
}
