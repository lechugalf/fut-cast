import { Column, Entity, JoinColumn, OneToOne, ManyToOne, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';
import { Event } from '../events/event.entity';
import { Team } from '@shared/entities/team.entity';

@Entity()
export class AnalysisResult {
  @PrimaryColumn()
  id: string = ulid();

  @OneToOne(() => Event, (event) => event.analysisResult)
  @JoinColumn()
  event: Event;

  @Column({ type: 'text' })
  analysis: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'text' })
  weatherSnapshot: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastWeatherRefreshedAt: Date | null;

  @ManyToOne(() => Team, { nullable: true })
  favoredTeam?: Team | null;

  @Column({ type: 'bool', nullable: true })
  asserted: boolean | null;

  @Column({ type: 'timestamptz' })
  refreshedAt: Date;
}
