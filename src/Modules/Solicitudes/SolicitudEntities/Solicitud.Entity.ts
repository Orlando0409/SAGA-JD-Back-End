import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn } from "typeorm";
import { EstadoSolicitud } from "./EstadoSolicitud.Entity";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { TipoEntidad } from "src/Common/Enums/TipoEntidad.enum";
import { Medidor } from "src/Modules/Inventario/InventarioEntities/Medidor.Entity";

@Entity('solicitud')
export abstract class Solicitud {
    @PrimaryGeneratedColumn()
    Id_Solicitud: number;

    @Column({ type: 'enum', enum: TipoEntidad, nullable: false })
    Tipo_Entidad: TipoEntidad;

    @Column({ nullable: false })
    Correo: string;

    @Column({ nullable: false })
    Numero_Telefono: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @Column({ nullable: false })
    Id_Tipo_Solicitud: number;

    @ManyToOne(() => EstadoSolicitud, estado => estado.Solicitudes)
    @JoinColumn({ name: 'Id_Estado_Solicitud' })
    Estado: EstadoSolicitud;

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

    @BeforeInsert()
    SetDefaultEstadoSolicitud() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }
    }
}

@Entity('solicitud_fisica')
export abstract class SolicitudFisica extends Solicitud {
    @Column({ type: 'enum', enum: TipoIdentificacion, nullable: false })
    Tipo_Identificacion: TipoIdentificacion;

    @Column({ type: 'varchar', length: 20, nullable: false })
    Identificacion: string;

    @Column({ nullable: false })
    Nombre: string;

    @Column({ nullable: false })
    Apellido1: string;

    @Column({ nullable: false })
    Apellido2: string;

    @BeforeInsert()
    @BeforeUpdate()
    normalizarApellido2() {
        if (!this.Apellido2 || this.Apellido2.trim() === '' || this.Apellido2 === 'undefined') {
            this.Apellido2 = 'No Proporcionado';
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Física;
        }
    }
}

@Entity('solicitud_juridica')
export class SolicitudJuridica extends Solicitud {
    @Column({ type: 'varchar', length: 20, nullable: false })
    Cedula_Juridica: string;

    @Column({ nullable: false })
    Razon_Social: string;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Jurídica;
        }
    }
}

@Entity('solicitud_afiliacion_fisica')
export class SolicitudAfiliacionFisica extends SolicitudFisica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Edad: number;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ name: 'Escritura_Terreno', nullable: false })
    Certificacion_Literal: string;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
        this.normalizarApellido2();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 1;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Física;
        }
    }
}

@Entity('solicitud_desconexion_fisica')
export class SolicitudDesconexionFisica extends SolicitudFisica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ name: 'Escritura_Terreno', nullable: false })
    Certificacion_Literal: string;

    @Column({ nullable: false })
    Id_Medidor: number;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
        this.normalizarApellido2();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 2;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Física;
        }
    }
}

@Entity('solicitud_cambio_medidor_fisica')
export class SolicitudCambioMedidorFisica extends SolicitudFisica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Id_Medidor: number;

    @Column({ nullable: false, type: 'varchar', length: 500 })
    Planos_Terreno: string;

    @Column({ name: 'Escritura_Terreno', nullable: false, type: 'varchar', length: 500 })
    Certificacion_Literal: string;

    @ManyToOne(() => Medidor, { nullable: true })
    @JoinColumn({ name: 'Id_Medidor' })
    Medidor: Medidor;

    @Column({ nullable: true, default: null })
    Id_Nuevo_Medidor: number;

    @ManyToOne(() => Medidor, { nullable: true, eager: false })
    @JoinColumn({ name: 'Id_Nuevo_Medidor' })
    Nuevo_Medidor: Medidor;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
        this.normalizarApellido2();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 3;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Física;
        }
    }
}

@Entity('solicitud_asociado_fisica')
export class SolicitudAsociadoFisica extends SolicitudFisica {
    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
        this.normalizarApellido2();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 4;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Física;
        }
    }
}

@Entity('solicitud_afiliacion_juridica')
export class SolicitudAfiliacionJuridica extends SolicitudJuridica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ name: 'Escritura_Terreno', nullable: false })
    Certificacion_Literal: string;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 1;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Jurídica;
        }
    }
}

@Entity('solicitud_desconexion_juridica')
export class SolicitudDesconexionJuridica extends SolicitudJuridica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ name: 'Escritura_Terreno', nullable: false })
    Certificacion_Literal: string;

    @Column({ nullable: false })
    Id_Medidor: number;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 2;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Jurídica;
        }
    }
}

@Entity('solicitud_cambio_medidor_juridica')
export class SolicitudCambioMedidorJuridica extends SolicitudJuridica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Id_Medidor: number;

    @Column({ nullable: false, type: 'varchar', length: 500 })
    Planos_Terreno: string;

    @Column({ name: 'Escritura_Terreno', nullable: false, type: 'varchar', length: 500 })
    Certificacion_Literal: string;

    @ManyToOne(() => Medidor, { nullable: true })
    @JoinColumn({ name: 'Id_Medidor' })
    Medidor: Medidor;

    @Column({ nullable: true, default: null })
    Id_Nuevo_Medidor: number;

    @ManyToOne(() => Medidor, { nullable: true, eager: false })
    @JoinColumn({ name: 'Id_Nuevo_Medidor' })
    Nuevo_Medidor: Medidor;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 3;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Jurídica;
        }
    }
}

@Entity('solicitud_asociado_juridica')
export class SolicitudAsociadoJuridica extends SolicitudJuridica {
    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 4;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Jurídica;
        }
    }
}

@Entity('solicitud_agregar_medidor_fisica')
export class SolicitudAgregarMedidorFisica extends SolicitudFisica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ name: 'Escritura_Terreno', nullable: false })
    Certificacion_Literal: string;

    @Column({ nullable: true, default: null })
    Id_Nuevo_Medidor: number;

    @ManyToOne(() => Medidor, { nullable: true, eager: false })
    @JoinColumn({ name: 'Id_Nuevo_Medidor' })
    Nuevo_Medidor: Medidor;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
        this.normalizarApellido2();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 5;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Física;
        }
    }
}

@Entity('solicitud_agregar_medidor_juridica')
export class SolicitudAgregarMedidorJuridica extends SolicitudJuridica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ name: 'Escritura_Terreno', nullable: false })
    Certificacion_Literal: string;

    @Column({ nullable: true, default: null })
    Id_Nuevo_Medidor: number;

    @ManyToOne(() => Medidor, { nullable: true, eager: false })
    @JoinColumn({ name: 'Id_Nuevo_Medidor' })
    Nuevo_Medidor: Medidor;

    @BeforeInsert()
    @BeforeUpdate()
    setNormalizarCampos() {
        this.normalizarTelefono();
    }

    @BeforeInsert()
    setDefaultEstados() {
        if (!this.Estado) {
            this.Estado = { Id_Estado_Solicitud: 1 } as EstadoSolicitud;
        }

        if (!this.Id_Tipo_Solicitud) {
            this.Id_Tipo_Solicitud = 5;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultTipoEntidad() {
        if (!this.Tipo_Entidad) {
            this.Tipo_Entidad = TipoEntidad.Jurídica;
        }
    }
}