import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ArchivoActa } from "./ArchivoActa.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Entity('acta')
export class Acta
{
    @PrimaryGeneratedColumn()
    Id_Acta: number;

    @Column({ nullable: false })
    Titulo: string;

    @Column({ nullable: true })
    Descripcion?: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @OneToMany(() => ArchivoActa, archivoActa => archivoActa.Acta, { cascade: true, eager: true })
    Archivos: ArchivoActa[];

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: 'Id_Usuario' })
    Usuario: Usuario;
}