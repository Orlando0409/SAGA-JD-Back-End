import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from 'typeorm';
import { UserEntity } from './Usuario.Entity';

@Entity('usuario_rol')

export class UserRol {
  @PrimaryGeneratedColumn()
  Id_Rol: number;

  @Column()
  Nombre_Rol: string;

  @OneToMany(() => UserEntity, user => user.rol)
  usuarios: UserEntity[];

  @Column('json')
  permisos: any;
}
