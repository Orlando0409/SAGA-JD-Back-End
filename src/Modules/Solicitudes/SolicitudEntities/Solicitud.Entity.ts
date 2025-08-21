import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { SolicitudEstado } from "./EstadoSolicitud.Entity";

@Entity('SolicitudEntity')

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

@Entity('SolicitudesAfiliacion')
export class SolicitudAfiliacion extends SolicitudEntity {
  @Column({ nullable: true })
  Planos_Terreno?: string;

  @Column({ nullable: true })
  Escritura_Terreno?: string;

  @BeforeInsert()
  setTipoSolicitud() { this.Id_Tipo_Solicitud = 1; }
}

@Entity('SolicitudesDesconexion')
export class SolicitudDesconexion extends SolicitudEntity {
  @Column({ nullable: true })
  Planos_Terreno?: string;

  @Column({ nullable: true })
  Escritura_Terreno?: string;

  @BeforeInsert()
  setTipoSolicitud() { this.Id_Tipo_Solicitud = 2; }
}

@Entity('SolicitudesMedidor')
export class SolicitudCambioMedidor extends SolicitudEntity {
  @Column()
  Ubicacion: string;

  @Column()
  Numero_Medidor_Anterior: number;

  @BeforeInsert()
  setTipoSolicitud() { this.Id_Tipo_Solicitud = 3; }
}