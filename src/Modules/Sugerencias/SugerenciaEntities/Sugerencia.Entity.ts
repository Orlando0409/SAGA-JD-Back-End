import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { EstadoSugerencia } from './EstadoSugerencia.Entity';

@Entity('sugerencias')
export class Sugerencia {
    @PrimaryGeneratedColumn()
    Id_Sugerencia: number;

    @Column({ type: 'text' })
    Mensaje: string;

    @Column({ type: 'varchar', length: 100 })
    Correo: string;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasSugerencia?: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Sugerencia: Date;

    @ManyToOne(() => EstadoSugerencia)
    @JoinColumn({ name: 'Id_Estado_Sugerencia' })
    Estado: EstadoSugerencia;
}