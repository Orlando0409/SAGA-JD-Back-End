import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('estado_queja')
export class EstadoQueja {
  @PrimaryGeneratedColumn()
  Id_Estado_Queja: number;

  @Column()
  Estado_Queja: string;
}