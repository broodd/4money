import {Entity, Column, BaseEntity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('people')
export class Person extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column('datetime') createdAt: Date;
  @Column('text') firstName: string;
  @Column('text') lastName: string;
  @Column('text') age: number;
}
