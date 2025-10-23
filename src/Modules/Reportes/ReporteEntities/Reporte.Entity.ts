import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoReporte } from './EstadoReporte.Entity';

@Entity('Reportes')
export class Reporte {
    @PrimaryGeneratedColumn()
    Id_Reporte: number;

    @Column({ nullable: false })
    Nombre: string;

    @Column()
    Papellido: string;

    @Column({ nullable: true })
    Segundo_Apellido?: string;

    @Column()
    ubicacion: string;

    @Column()
    descripcion: string;

    @Column({ nullable: false, type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Reporte: Date;

    @Column()
    Correo: string;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @ManyToOne(() => EstadoReporte)
    @JoinColumn({ name: 'Id_Estado_Reporte' })
    Estado: EstadoReporte;
}