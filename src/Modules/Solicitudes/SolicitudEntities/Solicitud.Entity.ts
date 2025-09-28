import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn } from "typeorm";
import { EstadoSolicitud } from "./EstadoSolicitud.Entity";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";
import { parsePhoneNumberFromString } from "libphonenumber-js";

@Entity('Solicitud')
@TableInheritance({ column: { type: "int", name: "Id_Tipo_Solicitud" } })
export abstract class Solicitud
{
    @PrimaryGeneratedColumn()
    Id_Solicitud: number;

    @Column({ nullable: false })
    Correo: string;

    @Column({ nullable: false })
    Numero_Telefono: string;

    @ManyToOne(() => EstadoSolicitud, estado => estado.Solicitudes)
    @JoinColumn({ name: 'Id_Estado_Solicitud' })
    Estado: EstadoSolicitud;

    @Column({ nullable: false })
    Id_Tipo_Solicitud: number;

    @CreateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

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

export abstract class SolicitudFisica extends Solicitud {
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

    @BeforeInsert()
    @BeforeUpdate()
    normalizarApellido2() {
        if (!this.Apellido2 || this.Apellido2.trim() === '' || this.Apellido2 === 'undefined') {
            this.Apellido2 = 'No Proporcionado';
        }
    }
}

export class SolicitudJuridica extends Solicitud {
    @Column({ type: 'varchar', length: 20, nullable: false })
    Cedula_Juridica: string;

    @Column({ nullable: false })
    Razon_Social: string;
}

@Entity('Solicitudes_Afiliacion_Fisica')
export class SolicitudAfiliacionFisica extends SolicitudFisica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Edad: number;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ nullable: false })
    Escritura_Terreno: string;

    @BeforeInsert()
    setDefaultEstado() { 
        this.normalizarTelefono();
        this.normalizarApellido2();
        this.Id_Tipo_Solicitud = 1;
        this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; 
    } 
}

@Entity('Solicitudes_Desconexion_Fisica')
export class SolicitudDesconexionFisica extends SolicitudFisica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ nullable: false })
    Escritura_Terreno: string;

    @BeforeInsert()
    setDefaultEstado() { 
        this.normalizarTelefono();
        this.normalizarApellido2();
        this.Id_Tipo_Solicitud = 2;
        this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; 
    } 
}

@Entity('Solicitudes_Cambio_Medidor_Fisica')
export class SolicitudCambioMedidorFisica extends SolicitudFisica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Numero_Medidor_Anterior: number;

    @BeforeInsert()
    setDefaultsAndNormalize() { 
        this.normalizarTelefono();
        this.normalizarApellido2();
        this.Id_Tipo_Solicitud = 3;
        this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; 
    }
}

@Entity('Solicitudes_Asociado_Fisica')
export class SolicitudAsociadoFisica extends SolicitudFisica {
    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @BeforeInsert()
    setDefaultsAndNormalize() { 
        this.normalizarTelefono();
        this.normalizarApellido2();
        this.Id_Tipo_Solicitud = 4;
        this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; 
    }
}

@Entity('Solicitudes_Afiliacion_Juridica')
export class SolicitudAfiliacionJuridica extends SolicitudJuridica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ nullable: false })
    Escritura_Terreno: string;

    @BeforeInsert()
    setDefaultEstado() { 
        this.normalizarTelefono();
        this.Id_Tipo_Solicitud = 1;
        this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; 
    }
}

@Entity('Solicitudes_Desconexion_Juridica')
export class SolicitudDesconexionJuridica extends SolicitudJuridica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ nullable: false })
    Escritura_Terreno: string;

    @BeforeInsert()
    setDefaultEstado() { 
        this.normalizarTelefono();
        this.Id_Tipo_Solicitud = 2;
        this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; 
    }
}

@Entity('Solicitudes_Cambio_Medidor_Juridica')
export class SolicitudCambioMedidorJuridica extends SolicitudJuridica {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Numero_Medidor_Anterior: number;

    @BeforeInsert()
    setDefaultsAndNormalize() { 
        this.normalizarTelefono();
        this.Id_Tipo_Solicitud = 3;
        this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; 
    }
}

@Entity('Solicitudes_Asociado_Juridica')
export class SolicitudAsociadoJuridica extends SolicitudJuridica {
    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @BeforeInsert()
    setDefaultsAndNormalize() { 
        this.normalizarTelefono();
        this.Id_Tipo_Solicitud = 4;
        this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; 
    }
}