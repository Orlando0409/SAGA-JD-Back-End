import {Entity,PrimaryGeneratedColumn,Column, ManyToOne,JoinColumn,DeleteDateColumn} from 'typeorm';
import { UserRol } from './UsuarioRol.Entity';

@Entity('usuario')
export class UserEntity {
  
    @PrimaryGeneratedColumn()
    Id_Usuario: number;

    @Column()
    Nombre_Usuario: string;

    @Column()
    Contraseña: string;

    @Column()
    Correo_Electronico: string;

    @Column({ nullable: true })
    Refresh_Token: string;

    @DeleteDateColumn({ name: 'Fecha_Eliminacion', nullable: true })
    Fecha_Eliminacion: Date;

    @Column({ nullable: true })
    id_Rol: number; 

    @ManyToOne(() => UserRol, rol => rol.usuarios, { nullable: true })
    @JoinColumn({ name: 'id_Rol' })
    rol: UserRol;
}

