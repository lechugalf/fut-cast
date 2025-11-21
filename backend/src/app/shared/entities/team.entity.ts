import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';
import { Venue } from './venue.entity';

@Entity()
export class Team {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id: string = ulid();

  @Column({ unique: true })
  externalId: string;

  @Column({ type: 'text' })
  name: string;

  @ManyToOne(() => Venue, { nullable: true })
  venue: Venue;

  @Column({ nullable: true })
  venueId: string | null;

  @Column({ type: 'text', nullable: true })
  alternateName: string | null;

  @Column({ type: 'text', nullable: true })
  shortName: string | null;

  @Column({ type: 'text', nullable: true })
  logoImageUrl: string | null;

  @Column({ type: 'text', nullable: true })
  badgeImageUrl: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  refreshedAt: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  rawSportsDBData: any;
}
