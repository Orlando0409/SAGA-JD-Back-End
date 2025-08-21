import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { UserRol } from "./UserRol";

@Entity("permisos")
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  modulo: string;

  @Column()
  Ver: boolean;

  @Column()
  Editar: boolean;

  @ManyToMany(() => UserRol, rol => rol.permisos)
  roles: UserRol[];
}