import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TipoTarifaLectura } from "./TipoTarifaLectura.Entity";

// Tabla para definir rangos de consumo y sus costos base por M3
@Entity('rango_consumo')
export class RangoConsumo {
    @PrimaryGeneratedColumn()
    Id_Rango_Consumo: number;

    @ManyToOne(() => TipoTarifaLectura, { nullable: false })
    @JoinColumn({ name: 'Id_Tipo_Tarifa_Lectura' })
    Tipo_Tarifa: TipoTarifaLectura;

    @Column({ type: 'int', nullable: false })
    Minimo_M3: number;

    @Column({ type: 'int', nullable: false })
    Maximo_M3: number;

    @Column({ type: 'int', nullable: false })
    Costo_Por_M3: number; // Costo base antes de aplicar factores
}