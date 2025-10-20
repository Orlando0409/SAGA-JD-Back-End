import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoSugerencia } from './EstadoSugerencia';


@Entity('sugerencias')
export class Sugerencia {
    @PrimaryGeneratedColumn()
    Id_Sugerencia: number;

    @Column()
    Fecha_Sugerencia: Date;

    @Column()
    Mensaje: string;

    @Column({ type: 'varchar', length: 100 })
    Correo: string;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasSugerencia?: string;

    @ManyToOne(() => EstadoSugerencia)
    @JoinColumn({ name: 'Id_EstadoSugerencia' })
    Estado: EstadoSugerencia;
}