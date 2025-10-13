import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Queja } from './Queja.Entity';

@Entity('Estado_Queja')
export class EstadoQueja {
  @PrimaryGeneratedColumn()
  Id_Estado_Queja: number;

  @Column()
  Estado_Queja: string;

  @OneToMany(() => Queja, (queja) => queja.Estado)
  Quejas: Queja[];
}
