import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Sugerencia } from "./Sugerencia.Entity";

@Entity('estado_sugerencia')
export class EstadoSugerencia{
    @PrimaryGeneratedColumn()
    Id_Estado_Sugerencia: number;    

    @Column({ nullable: false })
    Estado_Sugerencia: string;

    @OneToMany(() => Sugerencia, sugerencia => sugerencia.Estado)
    Sugerencias: Sugerencia[];
}