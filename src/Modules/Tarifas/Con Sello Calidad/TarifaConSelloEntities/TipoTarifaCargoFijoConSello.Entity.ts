import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CargoFijoTarifasConSello } from "./CargoFijoTarifasConSello.Entity";
import { RangoAfiliados } from "src/Modules/Lecturas/LecturaEntities/RangoAfiliados.Entity";
import { TarifaLecturaConSello } from "./TarifaLecturaConSello.Entity";

// Tabla intermedia para la relación muchos a muchos entre TipoTarifaLectura y CargoFijoTarifas
// Vincula cada cargo fijo con un rango de afiliados específico
@Entity('tipo_tarifa_cargo_fijo_con_sello')
export class TipoTarifaCargoFijoConSello {
    @PrimaryGeneratedColumn()
    Id_Tipo_Tarifa_Cargo_Fijo: number;

    @ManyToOne(() => TarifaLecturaConSello, tipoTarifa => tipoTarifa.Cargos_Fijos, { nullable: false })
    @JoinColumn({ name: 'Id_Tarifa_Lectura' })
    Tipo_Tarifa: TarifaLecturaConSello;

    @ManyToOne(() => CargoFijoTarifasConSello, cargoFijo => cargoFijo.Tipos_Tarifa, { nullable: false })
    @JoinColumn({ name: 'Id_Cargo_Fijo_Tarifa' })
    Cargo_Fijo: CargoFijoTarifasConSello;

    @ManyToOne(() => RangoAfiliados, { nullable: false })
    @JoinColumn({ name: 'Id_Rango_Afiliados' })
    Rango_Afiliados: RangoAfiliados;
}
