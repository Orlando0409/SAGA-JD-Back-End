import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TipoTarifaCargoFijoConSello } from "./TipoTarifaCargoFijoConSello.Entity";

// Entidad que representa los cargos fijos asociados a las tarifas de lectura, con su respectivo monto mensual
@Entity('cargo_fijo_tarifas_con_sello')
export class CargoFijoTarifasConSello {
    @PrimaryGeneratedColumn()
    Id_Cargo_Fijo_Tarifa: number;

    @Column({ type: 'int', nullable: false })
    Cargo_Fijo_Por_Mes: number; // Cargo fijo mensual en colones

    @OneToMany(() => TipoTarifaCargoFijoConSello, tipoTarifaCargoFijo => tipoTarifaCargoFijo.Cargo_Fijo)
    Tipos_Tarifa: TipoTarifaCargoFijoConSello[];
}