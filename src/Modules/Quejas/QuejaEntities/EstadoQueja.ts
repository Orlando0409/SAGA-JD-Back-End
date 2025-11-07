import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Estado_Queja')
export class EstadoQueja {
  @PrimaryGeneratedColumn()
  Id_Estado_Queja: number;

  @Column()
  Estado_Queja: string;
}