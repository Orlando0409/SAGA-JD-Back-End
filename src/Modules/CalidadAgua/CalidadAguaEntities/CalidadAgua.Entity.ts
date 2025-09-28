import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EstadoCalidadAgua } from "./EstadoCalidadAgua.Entity";

@Entity('Calidad_Agua')
export class CalidadAgua
{
    @PrimaryGeneratedColumn()
    Id_Calidad_Agua: number;

    @Column({ nullable: false })
    Titulo: string;

    @CreateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @Column({ nullable: false })
    Url_Archivo: string;

    @ManyToOne(() => EstadoCalidadAgua, estado => estado.CalidadAgua)
    Estado: EstadoCalidadAgua;

    @BeforeInsert()
    setDefaultEstado() { this.Estado = { Id_Estado_Calidad_Agua: 2, Nombre_Estado_Calidad_Agua: 'Invisible' } as EstadoCalidadAgua; }
}