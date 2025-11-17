import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Venue {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  externalId: string;
}
