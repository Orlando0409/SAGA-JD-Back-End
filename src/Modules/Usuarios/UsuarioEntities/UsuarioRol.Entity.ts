import { Column, PrimaryGeneratedColumn, Entity, OneToMany, ManyToMany, JoinTable, DeleteDateColumn } from 'typeorm';
import { Usuario } from './Usuario.Entity';
import { Permiso } from './Permiso.Entity';

@Entity('Usuario_Rol')
export class UsuarioRol {
  @PrimaryGeneratedColumn()
  Id_Rol: number;

  @Column({ nullable: false })
  Nombre_Rol: string;

  @DeleteDateColumn({ nullable: true })
  Fecha_Eliminacion: Date;

  @OneToMany(() => Usuario, usuario => usuario.Rol)
  Usuarios: Usuario[];

  @ManyToMany(() => Permiso, permiso => permiso.Roles)
  @JoinTable(
    {
      name: 'Rol_Permiso',
      joinColumn: { name: 'Id_Rol', referencedColumnName: 'Id_Rol' },
      inverseJoinColumn: { name: 'Id_Permiso', referencedColumnName: 'Id' },
    }
  )
  Permisos: Permiso[];
}