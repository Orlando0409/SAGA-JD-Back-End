import { Column, PrimaryGeneratedColumn, Entity, OneToMany, ManyToMany, JoinTable, DeleteDateColumn } from 'typeorm';
import { UserEntity } from './Usuario.Entity';
import { Permiso } from './Permiso.Entity';

@Entity('Usuario_Rol')

export class UserRol {
  @PrimaryGeneratedColumn()
  Id_Rol: number;

  @Column()
  Nombre_Rol: string;

  @DeleteDateColumn({ name: 'Fecha_Eliminacion', nullable: true })
  Fecha_Eliminacion: Date;

  @OneToMany(() => UserEntity, user => user.Rol)
  Usuarios: UserEntity[];

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
