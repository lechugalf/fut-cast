import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Event } from '../events/event.entity';
import { Team } from '@shared/entities/team.entity';

@Entity()
export class AnalysisResult {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => Event)
  event: Event;

  @Column({ type: 'text' })
  analysis: string;

  @Column({ type: 'text' })
  favoredTeam: Team;
}
