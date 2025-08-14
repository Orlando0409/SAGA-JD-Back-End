import { ChildEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SolicitudEstado } from "./EstadoSolicitud.Entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity('SolicitudEntity')

export class SolicitudEntity {
  @PrimaryGeneratedColumn()
  Id_Solicitud: number;

  @Column({ type: 'varchar', length: 12 })
  Cedula: string;

  @Column()
  Nombre: string;

  @Column()
  Apellido1: string;

  @Column()
  Apellido2: string;

  @Column()
  Correo: string;

  @Column()
  Direccion_Exacta: string;

  @Column()
  Motivo_Solicitud: string;

  @ManyToOne(() => SolicitudEstado, estado => estado.Solicitudes)
  @JoinColumn({ name: 'Id_Estado_Solicitud' })
  Estado: SolicitudEstado;

  @CreateDateColumn({ name: 'Fecha Solicitud', type: 'datetime' })
  Fecha_Creacion: Date;
}

@ChildEntity('SolicitudAfiliacion')
export class SolicitudAfiliacion extends SolicitudEntity {
  @PrimaryGeneratedColumn()
  Id_Solicitud_Afiliacion: number;
  
  @Column()
  PlanosTerreno: string;

  @Column()
  EscrituraTerreno: string;
}

@ChildEntity('SolicitudMedidor')
export class SolicitudCambioMediador extends SolicitudEntity {
  @PrimaryGeneratedColumn()
  Id_Solicitud_Cambio_Medidor: number;

  @Column()
  Ubicacion: string;

  @Column()
  Numero_Medidor_Anterior: number;
}

@ChildEntity('SolicitudDesconexion')
export class SolicitudDesconexion extends SolicitudEntity {
  @PrimaryGeneratedColumn()
  Id_Solicitud_Desconexion: number;

  @Column()
  PlanosTerreno: string;
}