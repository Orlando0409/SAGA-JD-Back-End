import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoReporte } from './EstadoReporte';

@Entity('reportes')
export class ReportesEntity {
    @PrimaryGeneratedColumn()
    IdReporte: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    Papellido?: string;

    @Column({ nullable: true })
    Sapellido?: string;

    @Column({ nullable: true })
    ubicacion?: string;

    @Column({ nullable: true })
    descripcion?: string;

    @Column()
    Fecha_Reporte: Date;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasReporte?: string;

    @ManyToOne(() => EstadoReporte)
    @JoinColumn({ name: 'IdEstadoReporte' })
    Estado: EstadoReporte;
}
