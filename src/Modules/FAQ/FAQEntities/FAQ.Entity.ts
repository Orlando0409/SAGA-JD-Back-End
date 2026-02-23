import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../../Usuarios/UsuarioEntities/Usuario.Entity";

@Entity("faq")
export class FAQEntity {
    @PrimaryGeneratedColumn()
    Id_FAQ: number;

    @Column({ type: "varchar", length: 255 })
    Pregunta: string;

    @Column({ type: "text" })
    Respuesta: string;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP", precision: 0 })
    Fecha_Actualizacion: Date;

    @Column({ default: true })
    Visible: boolean;

    @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { nullable: true })
    @JoinColumn({ name: 'Id_Usuario' })
    Usuario: Usuario;
}