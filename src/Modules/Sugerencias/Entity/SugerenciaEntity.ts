import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Estado_Sugerencia } from './EstadoSugerencia';

@Entity('sugerencias')
export class SugerenciaEntity {
    @PrimaryGeneratedColumn()
    Id_Sugerencia: number;

    @Column()
    Fecha_Sugerencia: Date;

    @Column()
    Descripcion: string;

    @Column({ type: 'simple-json', nullable: true })
    Imagen?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasSugerencia?: string;

    @ManyToOne(() => Estado_Sugerencia)
    @JoinColumn({ name: 'Id_EstadoSugerencia' })
    Estado: Estado_Sugerencia;
}