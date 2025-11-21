import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Venue } from '@shared/entities/venue.entity';
import { ulid } from 'ulid';

@Entity()
export class WeatherHourly {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id: string = ulid();

  @ManyToOne(() => Venue, (venue) => venue.hourlyForecasts, { onDelete: "CASCADE" })
  venue: Venue;

  @Column({ type: 'timestamp without time zone' })
  timestampUtc: Date;

  @Column("double precision", { nullable: true })
  precipitation: number;

  @Column("int", { nullable: true })
  precipitationProbability: number;

  // Weather Variables

  @Column("double precision", { nullable: true })
  rain: number;

  @Column("double precision", { nullable: true })
  showers: number;

  @Column("double precision", { nullable: true })
  snowfall: number;

  @Column("int", { nullable: true })
  weatherCode: number;

  @Column("double precision", { nullable: true })
  temperature2m: number;

  @Column("int", { nullable: true })
  relativeHumidity2m: number;

  @Column("double precision", { nullable: true })
  dewPoint2m: number;

  @Column("double precision", { nullable: true })
  apparentTemperature: number;

  @Column("double precision", { nullable: true })
  windSpeed10m: number;

  // Refreshed At

  @Column({ type: 'timestamptz' })
  refreshedAt: Date;
}
