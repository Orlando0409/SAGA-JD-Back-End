import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Auditoria')
export class Auditoria {
    @PrimaryGeneratedColumn()
    Id_Auditoria: number;

    @Column({ nullable: false })
    Modulo: string;

    @Column({ nullable: false })
    Accion: string;

    @Column({ nullable: false })
    Id_Registro: number

    @Column({ type: 'text', nullable: true })
    Datos_Anteriores: string; // JSON string con los datos antes del cambio

    @Column({ type: 'text', nullable: false })
    Datos_Nuevos: string; // JSON string con los datos después del cambio

    @CreateDateColumn( {type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Accion: Date;

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: 'Id_Usuario' })
    Usuario: Usuario;
}