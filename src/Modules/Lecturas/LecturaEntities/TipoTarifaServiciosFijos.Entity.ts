import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Tipo_Tarifa_Servicios_Fijos')
export class TipoTarifaServiciosFijos {
    @PrimaryGeneratedColumn()
    Id_Tipo_Tarifa_Servicios_Fijos: number;

    @Column()
    Nombre_Tipo_Tarifa: string;

    @Column()
    Cargo_Base: number;
}