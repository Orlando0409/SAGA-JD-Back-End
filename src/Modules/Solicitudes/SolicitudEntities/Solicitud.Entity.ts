import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { SolicitudEstado } from "./EstadoSolicitud.Entity";

@Entity('Solicitud')

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
  Direccion_Exacta: string;

  @Column({ nullable: false })
  Motivo_Solicitud: string;

  @Column({ nullable: false })
  Numero_Telefono: string;

  @ManyToOne(() => SolicitudEstado, estado => estado.Solicitud)
  @JoinColumn({ name: 'Id_Estado_Solicitud' })
  Estado: SolicitudEstado;

  @CreateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Creacion: Date;

  @Column({ nullable: false })
  Id_Tipo_Solicitud: number;
}

@Entity('Solicitudes_Afiliacion')
export class SolicitudAfiliacion extends SolicitudEntity {
  @Column({ nullable: false })
  Edad: number;

  @Column({ nullable: false })
  Planos_Terreno: string;

  @Column({ nullable: false })
  Escritura_Terreno: string;

  @BeforeInsert()
  setTipoSolicitud() { this.Id_Tipo_Solicitud = 1; }

  @BeforeInsert()
  setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as SolicitudEstado; } 
}

@Entity('Solicitudes_Desconexion')
export class SolicitudDesconexion extends SolicitudEntity {
  @Column({ nullable: false })
  Planos_Terreno: string;

  @Column({ nullable: false })
  Escritura_Terreno: string;

  @BeforeInsert()
  setTipoSolicitud() { this.Id_Tipo_Solicitud = 2; }

  @BeforeInsert()
  setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as SolicitudEstado; } 
}

@Entity('Solicitudes_Cambio_Medidor')
export class SolicitudCambioMedidor extends SolicitudEntity {
  @Column({ nullable: false })
  Ubicacion: string;

  @Column({ nullable: false })
  Numero_Medidor_Anterior: number;

  @BeforeInsert()
  setTipoSolicitud() { this.Id_Tipo_Solicitud = 3; }

  @BeforeInsert()
  setDefaultEstado() { this.Estado = { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' } as SolicitudEstado; } 
}