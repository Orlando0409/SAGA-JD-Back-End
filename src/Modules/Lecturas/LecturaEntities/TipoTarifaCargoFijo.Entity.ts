import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TipoTarifaLectura } from "./TipoTarifaLectura.Entity";
import { CargoFijoTarifas } from "./CargoFijoTarifas.Entity";
import { RangoAfiliados } from "./RangoAfiliados.Entity";

// Tabla intermedia para la relación muchos a muchos entre TipoTarifaLectura y CargoFijoTarifas
// Vincula cada cargo fijo con un rango de afiliados específico
@Entity('tipo_tarifa_cargo_fijo')
export class TipoTarifaCargoFijo {
    @PrimaryGeneratedColumn()
    Id_Tipo_Tarifa_Cargo_Fijo: number;

    @ManyToOne(() => TipoTarifaLectura, tipoTarifa => tipoTarifa.Cargos_Fijos, { nullable: false })
    @JoinColumn({ name: 'Id_Tipo_Tarifa_Lectura' })
    Tipo_Tarifa: TipoTarifaLectura;

    @ManyToOne(() => CargoFijoTarifas, cargoFijo => cargoFijo.Tipos_Tarifa, { nullable: false })
    @JoinColumn({ name: 'Id_Cargo_Fijo_Tarifa' })
    Cargo_Fijo: CargoFijoTarifas;

    @ManyToOne(() => RangoAfiliados, { nullable: false })
    @JoinColumn({ name: 'Id_Rango_Afiliados' })
    Rango_Afiliados: RangoAfiliados;
}
