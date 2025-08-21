import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SolicitudEntity } from "./Solicitud.Entity";

@Entity('SolicitudEstado')
export class SolicitudEstado {
  @PrimaryGeneratedColumn()
  Id_Estado_Solicitud: number;

  @Column({ type: 'varchar', length: 50 })
  Nombre_Estado: string;

  @OneToMany(() => SolicitudEntity, solicitud => solicitud.Estado)
  Solicitud: SolicitudEntity[]; 
}