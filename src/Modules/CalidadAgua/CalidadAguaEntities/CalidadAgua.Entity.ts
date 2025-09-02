import { BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @BeforeUpdate()
    updateTimestamp() { this.Fecha_Actualizacion = new Date(); }

    @Column({ nullable: false })
    Url_Archivo: string;
}