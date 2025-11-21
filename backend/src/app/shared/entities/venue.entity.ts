import { WeatherHourly } from '@app/weather/weather-hourly.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity()
export class Venue {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id: string = ulid();

  @Column({ unique: true, type: 'text' })
  externalId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  country: string;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'text' })
  rawTimezone: string;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @OneToMany(() => WeatherHourly, (wh) => wh.venue)
  hourlyForecasts: WeatherHourly[];

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  rawSportsDBData: any;
}
