import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { UsuarioRol } from "./UsuarioRol.Entity";

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

  @ManyToMany(() => UsuarioRol, rol => rol.Permisos)
  Roles: UsuarioRol[];
}