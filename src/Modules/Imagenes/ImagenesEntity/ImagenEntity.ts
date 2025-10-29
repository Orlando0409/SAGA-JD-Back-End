import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('imagenes')
export class ImagenEntity {
  @PrimaryGeneratedColumn()
  Id_Imagen: number;

  @Column({ type: 'varchar', length: 255 })
  Nombre_Imagen: string;

  @Column()
  Imagen: string; // URL de Dropbox

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Creacion: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Actualizacion: Date;
}