import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Lectura } from "./Lectura.Entity";
import { TipoTarifaCargoFijo } from "./TipoTarifaCargoFijo.Entity";

// Entidad que representa los tipos de tarifas para las lecturas, como residencial, comercial, etc.
@Entity('tipo_tarifa_lectura')
export class TipoTarifaLectura {
    @PrimaryGeneratedColumn()
    Id_Tipo_Tarifa_Lectura: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    Nombre_Tipo_Tarifa: string;

    @OneToMany(() => Lectura, lectura => lectura.Tipo_Tarifa)
    Lectura: Lectura[];

    @OneToMany(() => TipoTarifaCargoFijo, tipoTarifaCargoFijo => tipoTarifaCargoFijo.Tipo_Tarifa)
    Cargos_Fijos: TipoTarifaCargoFijo[];
}