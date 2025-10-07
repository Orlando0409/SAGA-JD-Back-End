import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Proveedor } from "./Proveedor.Entity";

@Entity('Tipo_Proveedor')
export class TipoProveedor {
    @PrimaryGeneratedColumn()
    Id_Tipo_Proveedor: number;

    @Column({ type: 'varchar', length: 50, nullable: false })
    Tipo_Proveedor: string;

    @OneToMany(() => Proveedor, proveedor => proveedor.Tipo_Proveedor)
    Proveedores: Proveedor[];
}