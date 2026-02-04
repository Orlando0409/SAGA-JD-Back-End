import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UnidadMedicion } from "./UnidadMedicion.Entity";

@Entity('estado_unidad_medicion')
export class EstadoUnidadMedicion {
    @PrimaryGeneratedColumn()
    Id_Estado_Unidad_Medicion: number;

    @Column({ nullable: false })
    Nombre_Estado_Unidad_Medicion: string;

    @OneToMany(() => UnidadMedicion, unidadMedicion => unidadMedicion.Estado_Unidad_Medicion)
    UnidadesMedicion: UnidadMedicion[];
}