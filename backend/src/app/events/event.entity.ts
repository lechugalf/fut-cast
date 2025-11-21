import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { Team } from '@shared/entities/team.entity';
import { League } from '@shared/entities/league.entity';
import { EventStatus } from './events.types';
import { ulid } from 'ulid';
import { Venue } from '@app/shared/entities/venue.entity';
import { AnalysisResult } from '@app/analysis/analysis-result.entity';

@Entity()
export class Event {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id: string = ulid();

  @Column({ unique: true, type: 'text' })
  externalId: string;

  @Column({ type: 'timestamptz' })
  eventDateTime: Date;

  // League
  @ManyToOne(() => League)
  league?: League;

  @Column({ nullable: false })
  leagueId: string;

  // Teams
  @ManyToOne(() => Team)
  homeTeam?: Team;

  @Column({ nullable: true })
  homeTeamId: string | null;

  @ManyToOne(() => Team)
  awayTeam?: Team;

  @Column({ nullable: true })
  awayTeamId: string | null;

  // Scores
  @Column({ nullable: true, type: 'smallint' })
  homeScore: number | null;

  @Column({ nullable: true, type: 'smallint' })
  awayScore: number | null;

  // Venue
  @ManyToOne(() => Venue)
  venue?: Venue;

  @Column({ nullable: true })
  venueId: string | null;

  // Status and Refresh state
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.NOT_STARTED,
  })
  status: EventStatus;

  @Column({ type: 'timestamptz' })
  refreshedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  nextRefreshAt: Date | null;

  @Column({ type: 'boolean' })
  locked: boolean;

  // Raw data for audit purposes
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  rawSportsDBData: any;

  // Analysis
  @OneToOne(() => AnalysisResult, (analysis) => analysis.event)
  analysisResult?: AnalysisResult;
}
