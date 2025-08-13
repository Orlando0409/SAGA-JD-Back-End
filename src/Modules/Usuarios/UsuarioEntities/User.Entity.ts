import {Entity,PrimaryGeneratedColumn,Column, ManyToOne} from 'typeorm';
//import { UserRol } from './Roles/UserRol';

@Entity('user')
export class UserEntity {
  
    @PrimaryGeneratedColumn()
    Id_Usuario: number;

    @Column()
    Nombre_Usuario: string;

    @Column()
    Contraseña: string;

    @Column()
    Correo_Electronico: string;

    //@ManyToOne(() => UserEntity, user => user.Id_Usuario) 
    //@JoinColumn({ name: 'id_Usuario' })
    //rol: UserRol
}

