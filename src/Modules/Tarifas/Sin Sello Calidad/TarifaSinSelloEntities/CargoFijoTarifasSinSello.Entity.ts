import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TarifaLecturaSinSello } from "./TarifaLecturaSinSello.Entity";
import { RangoAfiliadosSinSello } from "./RangoAfiliadosSinSello.Entity";

@Entity('cargo_fijo_tarifas_sin_sello')
export class CargoFijoTarifasSinSello {
    @PrimaryGeneratedColumn()
    Id_Cargo_Fijo!: number;

    @ManyToOne(() => TarifaLecturaSinSello, { nullable: false })
    @JoinColumn({ name: 'Id_Tarifa_Lectura' })
    Tipo_Tarifa!: TarifaLecturaSinSello;

    @ManyToOne(() => RangoAfiliadosSinSello, { nullable: false })
    @JoinColumn({ name: 'Id_Rango_Afiliados' })
    Rango_Afiliados!: RangoAfiliadosSinSello;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    Cargo_Fijo_Por_Mes!: number;

    @Column({ type: 'boolean', default: true, nullable: false })
    Activo!: boolean;
}