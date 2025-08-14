import{Column, PrimaryGeneratedColumn,Entity, OneToMany} from 'typeorm';
import { UserEntity } from '../UsuarioEntities/User.Entity';

@Entity('user_rol')

export class UserRol {
  @PrimaryGeneratedColumn()
  Id_Rol: number;

  @Column()
  Nombre_Rol: string;

  @OneToMany(() => UserEntity, user => user.rol)
  usuarios: UserEntity[];
}
