import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { EstadoProyecto } from './EstadoProyecto.Entity';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';

@Entity('proyecto')
export class Proyecto {
  @PrimaryGeneratedColumn()
  Id_Proyecto: number;

  @Column({ nullable: false })
  Titulo: string;

  @Column({
  type: 'varchar',
  length: 1000,
  nullable: false
})
Descripcion: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Creacion: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Actualizacion: Date;

  @Column({ nullable: false, default: false })
  Visible: boolean;

  @Column({ nullable: false })
  Imagen_Url: string;

  @ManyToOne(() => EstadoProyecto, Estado => Estado.Proyectos)  //Relacion Muchos A uno
  @JoinColumn({ name: 'Id_Estado_Proyecto' })  //LLave Foranea para acceder al estado del proyecto 
  Estado: EstadoProyecto;

  @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { eager: true })
  @JoinColumn({ name: 'Id_Usuario' })
  Usuario: Usuario;

  @BeforeInsert()
  setDefaultEstado() {
    if (!this.Estado) {
      this.Estado = { Id_Estado_Proyecto: 1 } as EstadoProyecto;
    }
  }
}