import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoReporte } from './EstadoReporte';

@Entity('reportes')
export class Reporte {
    @PrimaryGeneratedColumn()
    Id_Reporte: number;

    @Column()
    Nombre: string;

    @Column()
    Primer_Apellido: string;

    @Column({ nullable: true })
    Segundo_Apellido?: string;

    @Column()
    Ubicacion: string;

    @Column()
    Descripcion: string;

    @Column()
    Fecha_Reporte: Date;

    @Column()
    Correo: string;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasReporte?: string;

    @ManyToOne(() => EstadoReporte)
    @JoinColumn({ name: 'IdEstadoReporte' })
    Estado: EstadoReporte;
}