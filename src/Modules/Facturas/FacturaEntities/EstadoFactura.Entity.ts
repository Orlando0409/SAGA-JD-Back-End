import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Factura } from "./Factura.Entity";

@Entity('estado_factura')
export class EstadoFactura {
    @PrimaryGeneratedColumn()
    Id_Estado_Factura!: number;

    @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
    Nombre_Estado!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    Descripcion?: string;

    @OneToMany(() => Factura, factura => factura.Estado)
    Facturas!: Factura[];
}
