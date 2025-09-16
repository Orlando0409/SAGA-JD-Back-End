import { Column, PrimaryGeneratedColumn, Entity, OneToMany, ManyToMany, JoinTable, DeleteDateColumn } from 'typeorm';
import { UserEntity } from './Usuario.Entity';
import { Permiso } from './Permiso.Entity';

@Entity('usuario_rol')

export class UserRol {
  @PrimaryGeneratedColumn()
  Id_Rol: number;

  @Column()
  Nombre_Rol: string;

  @DeleteDateColumn({ name: 'Fecha_Eliminacion', nullable: true })
  Fecha_Eliminacion: Date;

  @OneToMany(() => UserEntity, user => user.rol)
  usuarios: UserEntity[];

  @ManyToMany(() => Permiso, permiso => permiso.roles)
  @JoinTable(
    {
      name: 'rol_permiso',
      joinColumn: { name: 'Id_Rol', referencedColumnName: 'Id_Rol' },
      inverseJoinColumn: { name: 'Id_Permiso', referencedColumnName: 'id' },
    }
  )
  permisos: Permiso[];
}
