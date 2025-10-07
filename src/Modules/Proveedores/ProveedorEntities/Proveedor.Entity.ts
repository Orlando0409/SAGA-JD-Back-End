import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, TableInheritance, BeforeInsert, BeforeUpdate, UpdateDateColumn, CreateDateColumn, JoinColumn } from "typeorm";
import { EstadoProveedor } from "./EstadoProveedor.Entity";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { TipoProveedor } from "./TipoProveedor.Entity";

@Entity("Proveedor")
@TableInheritance({ column: { type: "varchar", name: "Tipo_Proveedor" } })
export abstract class Proveedor {
    @PrimaryGeneratedColumn()
    Id_Proveedor: number;

    @Column({ nullable: false })
    Nombre_Proveedor: string;

    @Column({ nullable: false })
    Telefono_Proveedor: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @ManyToOne(() => EstadoProveedor, (estadoProveedor) => estadoProveedor.proveedor)
    @JoinColumn({ name: 'Id_Estado_Proveedor' })
    Estado_Proveedor: EstadoProveedor;

    @ManyToOne(() => TipoProveedor, (tipoProveedor) => tipoProveedor.Proveedores)
    @JoinColumn({ name: 'Id_Tipo_Proveedor' })
    Tipo_Proveedor: TipoProveedor;



    @BeforeInsert()
    @BeforeUpdate()
    normalizarTelefono() {
        if (this.Telefono_Proveedor) {
            try {
                const phoneNumber = parsePhoneNumberFromString(this.Telefono_Proveedor);
                if (phoneNumber) {
                      this.Telefono_Proveedor = phoneNumber.number; // siempre guarda en formato E.164
                }
            } catch {
                  // si hay error, simplemente no normalizamos
            }
        }
    }
}

@Entity("Proveedor_Fisico")
export class ProveedorFisico extends Proveedor {
    @Column({ type: 'enum', enum: TipoIdentificacion, nullable: false })
    Tipo_Identificacion: TipoIdentificacion;

    @Column({ type: 'varchar', length: 20, nullable: false })
    Identificacion: string;

    @BeforeInsert()
    SetDefaultTipoProveedor() { this.Tipo_Proveedor = { Id_Tipo_Proveedor: 1 } as TipoProveedor; }
}

@Entity("Proveedor_Juridico")
export class ProveedorJuridico extends Proveedor {
    @Column({ type: "varchar", length: 25 })
    Cedula_Juridica: string;

    @Column({ nullable: false })
    Razon_Social: string;

    @BeforeInsert()
    SetDefaultTipoProveedor() { this.Tipo_Proveedor = { Id_Tipo_Proveedor: 2 } as TipoProveedor; }
}