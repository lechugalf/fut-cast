import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Team {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  externalId: string;
}
