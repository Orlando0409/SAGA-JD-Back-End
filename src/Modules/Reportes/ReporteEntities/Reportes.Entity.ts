import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoReporte } from './EstadoReporte';

@Entity('Reportes')
export class Reporte {
    @PrimaryGeneratedColumn()
    Id_Reporte: number;

    @Column({ nullable: false })
    Nombre: string;

    @Column({ nullable: false })
    Primer_Apellido: string;

    @Column({ nullable: true })
    Segundo_Apellido?: string;

    @Column({ nullable: false })
    Ubicacion: string;

    @Column({ nullable: false })
    Descripcion: string;

    @Column({ nullable: false })
    Fecha_Reporte: Date;

    @Column({ nullable: false })
    Correo: string;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasReporte?: string;

    @ManyToOne(() => EstadoReporte)
    @JoinColumn({ name: 'Id_Estado_Reporte' })
    Estado: EstadoReporte;
}