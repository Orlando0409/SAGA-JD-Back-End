import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reporte } from './Reporte.Entity';

@Entity('Estado_Reporte')
export class EstadoReporte {
    @PrimaryGeneratedColumn()
    Id_Estado_Reporte: number;

    @Column({ nullable: false })
    Estado_Reporte: string;

    @OneToMany(() => Reporte, reporte => reporte.Estado)
    reportes: Reporte[];
}