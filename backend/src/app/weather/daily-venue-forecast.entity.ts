import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Venue } from '@shared/entities/venue.entity';

@Entity()
export class DailyVenueForecast {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => Venue)
  venue: Venue;

  // STORE FORECAST DATA BY HOUR
  // TODO: Provide a type for json
  @Column({ type: 'jsonb' })
  forecastData: any;
}
