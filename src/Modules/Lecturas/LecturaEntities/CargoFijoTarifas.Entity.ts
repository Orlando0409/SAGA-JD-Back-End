import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TipoTarifaCargoFijo } from "./TipoTarifaCargoFijo.Entity";

// Entidad que representa los cargos fijos asociados a las tarifas de lectura, con su respectivo monto mensual
@Entity('cargo_fijo_tarifas')
export class CargoFijoTarifas {
    @PrimaryGeneratedColumn()
    Id_Cargo_Fijo_Tarifa: number;

    @Column({ type: 'int', nullable: false })
    Cargo_Fijo_Por_Mes: number; // Cargo fijo mensual en colones

    @OneToMany(() => TipoTarifaCargoFijo, tipoTarifaCargoFijo => tipoTarifaCargoFijo.Cargo_Fijo)
    Tipos_Tarifa: TipoTarifaCargoFijo[];
}