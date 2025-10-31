import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from "typeorm"

@Entity('Manuales')
export class ManualEntity {
    @PrimaryGeneratedColumn()
    Id_Manual: number;

    @Column()
    Nombre_Manual: string;

    @Column()
    PDF_Manual: string;

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: 'Id_Usuario' })
    Usuario: Usuario;
}