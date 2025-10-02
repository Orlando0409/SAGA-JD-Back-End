import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { UserRol } from "./UsuarioRol.Entity";

@Entity("Permisos")
export class Permiso {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  Modulo: string;

  @Column({default: true})
  Ver: boolean;

  @Column({default: false})
  Editar: boolean;

  @ManyToMany(() => UserRol, rol => rol.Permisos)
  Roles: UserRol[];
}