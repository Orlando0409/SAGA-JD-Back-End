import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';

@Entity('imagenes')
export class ImagenEntity {
  @PrimaryGeneratedColumn()
  Id_Imagen: number;

  @Column({ type: 'varchar', length: 255 })
  Nombre_Imagen: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Creacion: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Actualizacion: Date;

  @Column()
  Imagen: string; // URL de Dropbox

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'Id_Usuario' })
  Usuario: Usuario;
}