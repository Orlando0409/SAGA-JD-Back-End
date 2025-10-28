import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Estado_Reporte')
export class EstadoReporte {
    @PrimaryGeneratedColumn()
    Id_Estado_Reporte: number;

    @Column()
    Estado_Reporte: string;
}