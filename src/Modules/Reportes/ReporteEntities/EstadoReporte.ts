import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('estado_reporte')
export class EstadoReporte {
    @PrimaryGeneratedColumn()
    Id_Estado_Reporte: number;

    @Column()
    Estado_Reporte: string;
}