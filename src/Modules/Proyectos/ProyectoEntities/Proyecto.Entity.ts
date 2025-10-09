import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { ProyectoEstado } from './EstadoProyecto.Entity';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';

@Entity('Proyecto')
export class Proyecto
{
    @PrimaryGeneratedColumn()
    Id_Proyecto: number;

    @Column({ nullable: false })
    Titulo: string;

    @Column({ type: 'text' })
    Descripcion: string;

    @CreateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @Column({ type: 'boolean', nullable: false })
    Visible: boolean;

    @Column()
    Imagen_Url: string;

    @ManyToOne(() => ProyectoEstado, Estado => Estado.Proyectos)  //Relacion Muchos A uno
    @JoinColumn({ name: 'Id_Estado_Proyecto' })  //LLave Foranea para acceder al estado del proyecto 
    Estado: ProyectoEstado; 


    @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario_Creador' })
    Usuario_Creador: Usuario;

    @BeforeInsert()
    setDefaultEstado() {
      if (!this.Estado) {
        this.Estado = { Id_Estado_Proyecto: 1 } as ProyectoEstado; 
      }
    }
}