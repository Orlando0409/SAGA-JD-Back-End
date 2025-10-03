import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, TableInheritance, BeforeInsert, BeforeUpdate, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { EstadoProveedor } from "./EstadoProveedor.Entity";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";
import { parsePhoneNumberFromString } from "libphonenumber-js";

@Entity("Proveedor")
@TableInheritance({ column: { type: "varchar", name: "Tipo_Proveedor" } })
export abstract class ProveedorEntity {
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
    Estado_Proveedor: EstadoProveedor;

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
export class ProveedorFisico extends ProveedorEntity {
    @Column({ type: 'enum', enum: TipoIdentificacion, nullable: false })
    Tipo_Identificacion: TipoIdentificacion;

    @Column({ type: 'varchar', length: 20, nullable: false })
    Identificacion: string;
}

@Entity("Proveedor_Juridico")
export class ProveedorJuridico extends ProveedorEntity {
    @Column({ type: "varchar", length: 25 })
    Cedula_Juridica: string;

    @Column({ nullable: false })
    Razon_Social: string;
}
