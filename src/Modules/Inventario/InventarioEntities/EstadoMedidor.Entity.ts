import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Medidor } from "./Medidor.Entity";

@Entity('estado_medidor')
export class EstadoMedidor {
    @PrimaryGeneratedColumn()
    Id_Estado_Medidor: number;

    @Column({ nullable: false })
    Nombre_Estado_Medidor: string;

    @OneToMany(() => Medidor, medidor => medidor.Estado_Medidor)
    Medidores: Medidor[];
}