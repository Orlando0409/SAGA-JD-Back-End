import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { CalidadAgua } from "./CalidadAgua.Entity";

@Entity('Estado_Calidad_Agua')
export class EstadoCalidadAgua {
    @PrimaryGeneratedColumn()
    Id_Estado_Calidad_Agua: number;
    
    @Column({ nullable: false })
    Nombre_Estado_Calidad_Agua: string;

    @OneToMany(() => CalidadAgua, calidadAgua => calidadAgua.Estado)
    CalidadAgua: CalidadAgua[];
}