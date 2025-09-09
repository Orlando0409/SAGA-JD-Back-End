import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EstadoSolicitud } from "./EstadoSolicitud.Entity";

@Entity('Solicitud_Fisica')
export abstract class SolicitudEntity
{
    @PrimaryGeneratedColumn()
    Id_Solicitud: number;

    @PrimaryColumn({ nullable: false })
    @Column({ type: 'varchar', length: 12 })
    Cedula: string;

    @Column({ nullable: false })
    Nombre: string;

    @Column({ nullable: false })
    Apellido1: string;

    @Column()
    Apellido2: string;

    @Column({ nullable: false })
    Correo: string;

    @Column({ nullable: false })
    Numero_Telefono: string;

    @ManyToOne(() => EstadoSolicitud, estado => estado.Solicitud)
    @JoinColumn({ name: 'Id_Estado_Solicitud' })
    Estado: EstadoSolicitud;

    @CreateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @Column({ nullable: false })
    Id_Tipo_Solicitud: number;
}

@Entity('Solicitudes_Afiliacion')
export class SolicitudAfiliacion extends SolicitudEntity {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Edad: number;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ nullable: false })
    Escritura_Terreno: string;

    @BeforeInsert()
    setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; } 
}

@Entity('Solicitudes_Desconexion')
export class SolicitudDesconexion extends SolicitudEntity {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Planos_Terreno: string;

    @Column({ nullable: false })
    Escritura_Terreno: string;

    @BeforeInsert()
    setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; } 
}

@Entity('Solicitudes_Cambio_Medidor')
export class SolicitudCambioMedidor extends SolicitudEntity {
    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @Column({ nullable: false })
    Numero_Medidor_Anterior: number;

    @BeforeInsert()
    setTipoSolicitud() { this.Id_Tipo_Solicitud = 3; }

    @BeforeInsert()
    setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; } 
}

@Entity('Solicitudes_Asociado')
export class SolicitudAsociado extends SolicitudEntity {
    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @BeforeInsert()
    setTipoSolicitud() { this.Id_Tipo_Solicitud = 4; }

    @BeforeInsert()
    setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as EstadoSolicitud; }
}