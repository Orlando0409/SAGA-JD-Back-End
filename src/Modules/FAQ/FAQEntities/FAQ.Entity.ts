import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "../../Usuarios/UsuarioEntities/Usuario.Entity";

@Entity("FAQ")
export class FAQEntity {

    @PrimaryGeneratedColumn()
    Id_FAG: number;

    @Column({ type: "varchar", length: 255 })
    Pregunta: string;

    @Column({ type: "text" })
    Respuesta: string;

    @Column()
    Fecha_Creacion: Date;

    @Column()
    Fecha_Actualizacion: Date;

    @Column({ default: true })
    Visible: boolean;

    @Column({ nullable: true })
    Id_Usuario: number;

    @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { nullable: true })
    @JoinColumn({ name: 'Id_Usuario' })
    Usuario: Usuario;
}