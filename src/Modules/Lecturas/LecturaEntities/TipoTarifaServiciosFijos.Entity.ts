import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TipoTarifaLectura } from "./TipoTarifaLectura.Entity";

// Tabla para almacenar los cargos fijos mensuales por servicios según tipo de tarifa y rango de afiliados
@Entity('tipo_tarifa_servicios_fijos')
export class TipoTarifaServiciosFijos {
    @PrimaryGeneratedColumn()
    Id_Tipo_Tarifa_Servicios_Fijos: number;

    @ManyToOne(() => TipoTarifaLectura, { nullable: false })
    @JoinColumn({ name: 'Id_Tipo_Tarifa_Lectura' })
    Tipo_Tarifa: TipoTarifaLectura;

    @Column({ type: 'int', nullable: false })
    Minimo_Afiliados: number;

    @Column({ type: 'int', nullable: false })
    Maximo_Afiliados: number;

    @Column({ type: 'varchar', length: 20, nullable: false })
    Nombre_Rango: string; // "1-100", "101-300", "301-1000", "1000+"

    @Column({ type: 'int', nullable: false })
    Cargo_Base: number; // Cargo fijo mensual en colones
}