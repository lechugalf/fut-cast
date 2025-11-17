import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class League {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  externalId: string;
}
