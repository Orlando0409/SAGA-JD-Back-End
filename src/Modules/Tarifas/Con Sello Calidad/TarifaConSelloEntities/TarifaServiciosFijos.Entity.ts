import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TarifaLecturaConSello } from "./TarifaLecturaConSello.Entity";

// Tabla para almacenar los cargos fijos mensuales por servicios según tipo de tarifa y rango de afiliados
@Entity('tipo_tarifa_servicios_fijos_con_sello')
export class TipoTarifaServiciosFijosConSello {
    @PrimaryGeneratedColumn()
    Id_Tarifa_Servicios_Fijos: number;

    @ManyToOne(() => TarifaLecturaConSello, { nullable: false })
    @JoinColumn({ name: 'Id_Tarifa_Lectura' })
    Tipo_Tarifa: TarifaLecturaConSello;

    @Column({ type: 'int', nullable: false })
    Minimo_Afiliados: number;

    @Column({ type: 'int', nullable: false })
    Maximo_Afiliados: number;

    @Column({ type: 'varchar', length: 20, nullable: false })
    Nombre_Rango: string; // "1-100", "101-300", "301-1000", "1000+"

    @Column({ type: 'int', nullable: false })
    Cargo_Base: number; // Cargo fijo mensual en colones
}