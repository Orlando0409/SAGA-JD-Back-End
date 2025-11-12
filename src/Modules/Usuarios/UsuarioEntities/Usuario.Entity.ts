import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { UsuarioRol } from './UsuarioRol.Entity';

@Entity('Usuario')
export class Usuario {
    @PrimaryGeneratedColumn()
    Id_Usuario: number;

    @Column({ nullable: false })
    Nombre_Usuario: string;

    @Column({ nullable: false })
    Contraseña: string;

    @Column({ nullable: false })
    Correo_Electronico: string;

    @Column({ nullable: true })
    Refresh_Token: string;

    @DeleteDateColumn({ name: 'Fecha_Eliminacion', nullable: true })
    Fecha_Eliminacion: Date;

    @Column({ nullable: true })
    Id_Rol: number; 

    @ManyToOne(() => UsuarioRol, rol => rol.Usuarios, { nullable: true })
    @JoinColumn({ name: 'Id_Rol' })
    Rol: UsuarioRol;
}