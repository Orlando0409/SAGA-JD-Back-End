import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, BeforeUpdate, UpdateDateColumn, CreateDateColumn, JoinColumn, OneToMany, ChildEntity } from "typeorm";
import { EstadoProveedor } from "./EstadoProveedor.Entity";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Material } from "src/Modules/Inventario/InventarioEntities/Material.Entity";
import { TipoEntidad } from "src/Common/Enums/TipoEntidad.enum";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Entity("proveedor")
export abstract class Proveedor {
    @PrimaryGeneratedColumn()
    Id_Proveedor: number;

    @Column({ type: 'enum', enum: TipoEntidad, nullable: false })
    Tipo_Entidad: TipoEntidad;

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

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: 'Id_Usuario' })
    Usuario: Usuario;

    @OneToMany(() => Material, material => material.Proveedor)
    materiales: Material[];

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

@Entity('proveedor_fisico')
export class ProveedorFisico extends Proveedor {
    @Column({ type: 'enum', enum: TipoIdentificacion, nullable: false })
    Tipo_Identificacion: TipoIdentificacion;

    @Column({ type: 'varchar', length: 20, nullable: false })
    Identificacion: string;

    @BeforeInsert()
    SetDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Física;
        }
    }
}

@Entity('proveedor_juridico')
export class ProveedorJuridico extends Proveedor {
    @Column({ type: "varchar", length: 25 })
    Cedula_Juridica: string;

    @Column({ nullable: false })
    Razon_Social: string;

    @BeforeInsert()
    SetDefaultTipoProveedor() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Jurídica;
        }
    }
}