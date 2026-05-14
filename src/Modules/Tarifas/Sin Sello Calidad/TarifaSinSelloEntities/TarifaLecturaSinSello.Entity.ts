import { Lectura } from "src/Modules/Lecturas/LecturaEntities/Lectura.Entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tarifa_lectura_sin_sello')
export class TarifaLecturaSinSello {
    @PrimaryGeneratedColumn()
    Id_Tarifa_Lectura!: number;

    @Column({ nullable: false })
    Nombre_Tipo_Tarifa!: string;

    @Column({ nullable: true })
    Descripcion?: string;

    @Column({ nullable: false })
    Activa!: boolean;

    @OneToMany(() => Lectura, lectura => lectura.Tipo_Tarifa)
    Lectura: Lectura[];
}