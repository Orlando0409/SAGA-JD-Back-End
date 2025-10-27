import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Lectura } from "./Lectura.Entity";
import { Bloque } from "./Bloque.Entity";

@Entity('Tipo_Tarifa_Lectura')
export class TipoTarifaLectura {
    @PrimaryGeneratedColumn()
    Id_Tipo_Tarifa_Lectura: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    Nombre_Tipo_Tarifa: string;

    @Column({ type: 'int', nullable: false })
    Cargo_Fijo_Por_Mes: number;

    @OneToMany(() => Lectura, lectura => lectura.Tipo_Tarifa, { nullable: false })
    Lectura: Lectura[];

    @OneToMany(() => Bloque, bloque => bloque.Id_Tipo_Tarifa, { nullable: false })
    Bloques: Bloque[];
}