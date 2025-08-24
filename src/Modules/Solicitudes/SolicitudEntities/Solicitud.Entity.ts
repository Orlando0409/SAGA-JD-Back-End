import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { SolicitudEstado } from "./EstadoSolicitud.Entity";

@Entity('Solicitud')

export abstract class SolicitudEntity
{
  @PrimaryGeneratedColumn()
  Id_Solicitud: number;

  @PrimaryColumn()
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

  @ManyToOne(() => SolicitudEstado, estado => estado.Solicitud)
  @JoinColumn({ name: 'Id_Estado_Solicitud' })
  Estado: SolicitudEstado;

  @CreateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Creacion: Date;

  @Column()
  Id_Tipo_Solicitud: number;
}

@Entity('Solicitudes_Afiliacion')
export class SolicitudAfiliacion extends SolicitudEntity {
  @Column()
  Planos_Terreno: string;

  @Column()
  Escritura_Terreno: string;

  @BeforeInsert()
  setTipoSolicitud() { this.Id_Tipo_Solicitud = 1; }

  @BeforeInsert()
  setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as SolicitudEstado; } 
}

@Entity('Solicitudes_Desconexion')
export class SolicitudDesconexion extends SolicitudEntity {
  @Column()
  Planos_Terreno: string;

  @Column()
  Escritura_Terreno: string;

  @BeforeInsert()
  setTipoSolicitud() { this.Id_Tipo_Solicitud = 2; }

  @BeforeInsert()
  setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as SolicitudEstado; } 
}

@Entity('Solicitudes_Cambio_Medidor')
export class SolicitudCambioMedidor extends SolicitudEntity {
  @Column()
  Ubicacion: string;

  @Column()
  Numero_Medidor_Anterior: number;

  @BeforeInsert()
  setTipoSolicitud() { this.Id_Tipo_Solicitud = 3; }

  @BeforeInsert()
  setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as SolicitudEstado; } 
}