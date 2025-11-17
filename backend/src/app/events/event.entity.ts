import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Team } from '@shared/entities/team.entity';
import { League } from '@shared/entities/league.entity';

@Entity()
export class Event {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  externalId: string;

  @Column({ type: 'timestamptz' })
  eventDate: Date;

  @Column()
  status: string;

  @ManyToOne(() => League)
  league: League;

  @ManyToOne(() => Team)
  homeTeam: Team;

  @ManyToOne(() => Team)
  awayTeam: Team;

  @Column({ nullable: true, type: 'smallint' })
  homeScore: number;

  @Column({ nullable: true, type: 'smallint' })
  awayScore: number;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  rawSportsDBData: any;
}
