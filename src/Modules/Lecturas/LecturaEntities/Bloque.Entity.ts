import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TipoTarifaLectura } from "./TipoTarifaLectura.Entity";

@Entity('Bloque')
export class Bloque {
    @PrimaryGeneratedColumn()
    Id_Bloque: number;

    @ManyToOne(() => TipoTarifaLectura, tipoTarifa => tipoTarifa.Bloques, { nullable: false })
    Id_Tipo_Tarifa: TipoTarifaLectura;

    @Column({ type: 'int', nullable: false })
    Minimo_M3: number;

    @Column({ type: 'int', nullable: false })
    Maximo_M3: number;

    @Column({ type: 'int', nullable: false })
    Cargo_Base: number;
}