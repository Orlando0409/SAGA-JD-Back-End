import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Solicitud } from "./Solicitud.Entity";

@Entity('estado_solicitud')
export class EstadoSolicitud {
  @PrimaryGeneratedColumn()
  Id_Estado_Solicitud: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  Nombre_Estado: string;

  @OneToMany(() => Solicitud, solicitud => solicitud.Estado)
  Solicitudes: Solicitud[];
}