import { TarifaLecturaConSello } from "src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaLecturaConSello.Entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

// Tabla para definir rangos de consumo y sus costos base por M3
@Entity('rango_consumo')
export class RangoConsumo {
    @PrimaryGeneratedColumn()
    Id_Rango_Consumo: number;

    @ManyToOne(() => TarifaLecturaConSello, { nullable: false })
    @JoinColumn({ name: 'Id_Tarifa_Lectura' })
    Tipo_Tarifa: TarifaLecturaConSello;

    @Column({ type: 'int', nullable: false })
    Minimo_M3: number;

    @Column({ type: 'int', nullable: false })
    Maximo_M3: number;

    @Column({ type: 'int', nullable: false })
    Costo_Por_M3: number; // Costo base antes de aplicar factores
}