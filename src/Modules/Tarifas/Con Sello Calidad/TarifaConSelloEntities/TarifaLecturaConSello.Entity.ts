import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Lectura } from "src/Modules/Lecturas/LecturaEntities/Lectura.Entity";
import { TipoTarifaCargoFijoConSello } from "./TipoTarifaCargoFijoConSello.Entity";

// Entidad que representa los tipos de tarifas para las lecturas, como residencial, comercial, etc.
@Entity('tarifa_lectura_con_sello')
export class TarifaLecturaConSello {
    @PrimaryGeneratedColumn()
    Id_Tarifa_Lectura: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    Nombre_Tipo_Tarifa: string;

    @OneToMany(() => Lectura, lectura => lectura.Tipo_Tarifa)
    Lectura: Lectura[];

    @OneToMany(() => TipoTarifaCargoFijoConSello, tipoTarifaCargoFijo => tipoTarifaCargoFijo.Tipo_Tarifa)
    Cargos_Fijos: TipoTarifaCargoFijoConSello[];
}