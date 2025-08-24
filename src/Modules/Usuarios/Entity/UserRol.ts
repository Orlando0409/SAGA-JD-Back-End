import { Column, PrimaryGeneratedColumn, Entity, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from './User.Entity';
import { Permiso } from './Permiso.Entity';

@Entity('user_rol')

export class UserRol {
  @PrimaryGeneratedColumn()
  Id_Rol: number;

  @Column()
  Nombre_Rol: string;

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
