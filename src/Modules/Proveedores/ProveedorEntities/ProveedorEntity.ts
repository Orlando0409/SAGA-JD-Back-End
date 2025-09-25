import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, TableInheritance } from "typeorm";
import { EstadoProveedor } from "./EstadoProveedor";

@Entity("proveedores")
@TableInheritance({ column: { type: "varchar", name: "Tipo_Proveedor" } })
export abstract class ProveedorEntity {
  @PrimaryGeneratedColumn()
  Id_Proveedor: number;

  @Column()
  Nombre_Proveedor: string;

  @Column({ type: "varchar", length: 25 })
  Telefono_Proveedor: string;

  @ManyToOne(() => EstadoProveedor, (estadoProveedor) => estadoProveedor.proveedor)
  estadoProveedor: EstadoProveedor;
}

@Entity("proveedor_fisico")
export class ProveedorFisico extends ProveedorEntity {
  @Column()
  Cedula_Fisica: number;
}

@Entity("proveedor_juridico")
export class ProveedorJuridico extends ProveedorEntity {
  @Column()
  Cedula_Juridica: number;

  @Column({ type: "varchar", length: 150 })
  Razon_social: string;
}
