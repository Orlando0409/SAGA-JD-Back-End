import { Column,Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Estado_Sugerencia')

export class EstadoSugerencia{
    @PrimaryGeneratedColumn()
    Id_EstadoSugerencia: number;    

    @Column()
    Estado_Sugerencia: string;
}