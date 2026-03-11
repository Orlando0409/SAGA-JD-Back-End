import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EstadoAfiliado } from "./EstadoAfiliado.Entity";
import { TipoAfiliado } from "./TipoAfiliado.Entity";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Medidor } from "src/Modules/Inventario/InventarioEntities/Medidor.Entity";
import { TipoEntidad } from "src/Common/Enums/TipoEntidad.enum";

@Entity('afiliado')
export abstract class Afiliado {
    @PrimaryGeneratedColumn()
    Id_Afiliado: number;

    @Column({ type: 'enum', enum: TipoEntidad, nullable: false })
    Tipo_Entidad: TipoEntidad;

    @Column({ nullable: false })
    Correo: string;

    @Column({ nullable: false })
    Numero_Telefono: string;

    @Column({ nullable: false })
    Direccion_Exacta: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @ManyToOne(() => EstadoAfiliado, estado => estado.Afiliados)
    @JoinColumn({ name: 'Id_Estado_Afiliado' })
    Estado: EstadoAfiliado;

    @ManyToOne(() => TipoAfiliado, tipo => tipo.Afiliados)
    @JoinColumn({ name: 'Id_Tipo_Afiliado' })
    Tipo_Afiliado: TipoAfiliado;

    @OneToMany(() => Medidor, (medidor) => medidor.Afiliado)
    Medidores: Medidor[];

    @BeforeInsert()
    @BeforeUpdate()
    normalizarTelefono() {
        if (this.Numero_Telefono) {
            try {
                const phoneNumber = parsePhoneNumberFromString(this.Numero_Telefono);
                if (phoneNumber) {
                    this.Numero_Telefono = phoneNumber.number; // siempre guarda en formato E.164
                }
            } catch {
                // si hay error, simplemente no normalizamos
            }
        }
    }
}

@Entity('afiliado_fisico')
export class AfiliadoFisico extends Afiliado {
    @Column({ type: 'enum', enum: TipoIdentificacion, nullable: false })
    Tipo_Identificacion: TipoIdentificacion;

    @Column({ type: 'varchar', length: 20, nullable: false })
    Identificacion: string;

    @Column({ nullable: false })
    Nombre: string;

    @Column({ nullable: false })
    Apellido1: string;

    @Column({ nullable: true })
    Apellido2?: string;

    @Column({ nullable: false })
    Edad: number;

    @BeforeInsert()
    setDefaultEstado() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Afiliado: 1 } as EstadoAfiliado;
        }
    }

    @BeforeInsert()
    setTipoAfiliado() {
        if (!this.Tipo_Afiliado) {
            this.Tipo_Afiliado = { Id_Tipo_Afiliado: 1 } as TipoAfiliado;
        }
    }

    @BeforeInsert()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Física;
        }
    }
}

@Entity('afiliado_juridico')
export class AfiliadoJuridico extends Afiliado {
    @Column({ type: 'varchar', length: 20, nullable: false })
    Cedula_Juridica: string;

    @Column({ nullable: false })
    Razon_Social: string;

    @BeforeInsert()
    setDefaultEstado() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Afiliado: 1 } as EstadoAfiliado;
        }
    }

    @BeforeInsert()
    setTipoAfiliado() {
        if (!this.Tipo_Afiliado) {
            this.Tipo_Afiliado = { Id_Tipo_Afiliado: 2 } as TipoAfiliado;
        }
    }

    @BeforeInsert()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Jurídica;
        }
    }
}