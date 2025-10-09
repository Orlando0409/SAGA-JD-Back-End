import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoReporte } from './EstadoReporte';

@Entity('reportes')
export class ReportesEntity {
    @PrimaryGeneratedColumn()
    IdReporte: number;

    @Column()
    Nombre: string;

    @Column({ nullable: true })
    Primer_Apellido?: string;

    @Column({ nullable: true })
    Segundo_Apellido?: string;

    @Column({ nullable: true })
    Ubicacion?: string;

    @Column({ nullable: true })
    Descripcion_Reporte?: string;

    @Column()
    Fecha_Reporte: Date;

    @Column({ type: 'simple-json', nullable: true })
    Imagen?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasReporte?: string;

    @ManyToOne(() => EstadoReporte)
    @JoinColumn({ name: 'IdEstadoReporte' })
    Estado: EstadoReporte;
}
