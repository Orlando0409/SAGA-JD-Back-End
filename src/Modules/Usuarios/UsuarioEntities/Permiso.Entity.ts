import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { UserRol } from "./UserRol";

@Entity("permisos")
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  modulo: string;

  @Column({default: true})
  Ver: boolean;

  @Column({default: false})
  Editar: boolean;

  @ManyToMany(() => UserRol, rol => rol.permisos)
  roles: UserRol[];
}