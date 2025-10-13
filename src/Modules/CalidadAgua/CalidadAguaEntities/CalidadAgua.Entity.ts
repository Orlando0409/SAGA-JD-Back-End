import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('Calidad_Agua')
export class CalidadAgua
{
    @PrimaryGeneratedColumn()
    Id_Calidad_Agua: number;

    @Column({ nullable: false })
    Titulo: string;

    @Column({ nullable: false })
    Descripcion: string;

    @CreateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @Column({ nullable: false, default: false })
    Visible: boolean;

    @Column({ nullable: false })
    Url_Archivo: string;

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: 'Id_Usuario_Creador' })
    Usuario_Creador: Usuario;
}