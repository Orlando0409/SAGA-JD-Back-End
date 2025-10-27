import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Tipo_Tarifa_Venta_Agua')
export class TipoTarifaVentaAgua {
    @PrimaryGeneratedColumn()
    Id_Tipo_Tarifa_Venta_Agua: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    Nombre_Tipo_Tarifa: string;

    @Column({ type: 'int', nullable: false })
    Cargo_Por_M3: number;
}