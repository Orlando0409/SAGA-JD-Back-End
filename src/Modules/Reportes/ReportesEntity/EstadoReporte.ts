
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('estado_reporte')
export class EstadoReporte {
    
    @PrimaryGeneratedColumn()
    IdEstadoReporte: number;

    @Column()
    Estado_Reporte: string;
}
