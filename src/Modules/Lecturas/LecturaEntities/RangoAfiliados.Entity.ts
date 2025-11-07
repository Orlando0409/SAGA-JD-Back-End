import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TipoTarifaLectura } from "./TipoTarifaLectura.Entity";

// Tabla para definir rangos de afiliados con sus costos base directos
@Entity('Rango_Afiliados')
export class RangoAfiliados {
    @PrimaryGeneratedColumn()
    Id_Rango_Afiliados: number;

    @ManyToOne(() => TipoTarifaLectura, { nullable: false })
    @JoinColumn({ name: 'Id_Tipo_Tarifa_Lectura' })
    Tipo_Tarifa: TipoTarifaLectura;

    @Column({ type: 'int', nullable: false })
    Minimo_Afiliados: number;

    @Column({ type: 'int', nullable: false })
    Maximo_Afiliados: number;

    @Column({ nullable: false })
    Nombre_Rango: string; // "1-100", "101-300", etc.

    @Column({ type: 'int', nullable: false })
    Costo_Por_M3: number; // Costo base directo en colones por M³
}