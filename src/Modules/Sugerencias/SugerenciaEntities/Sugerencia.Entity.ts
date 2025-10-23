import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoSugerencia } from './EstadoSugerencia.Entity';

@Entity('Sugerencias')
export class Sugerencia {
    @PrimaryGeneratedColumn()
    Id_Sugerencia: number;

    @Column()
    Mensaje: string;

    @Column()
    Fecha_Sugerencia: Date;

    @Column({ type: 'text', nullable: true })
    Respuesta_Sugerencia?: string;

    @Column({ type: 'varchar', length: 100 })
    Correo: string;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @ManyToOne(() => EstadoSugerencia)
    @JoinColumn({ name: 'Id_Estado_Sugerencia' })
    Estado: EstadoSugerencia;
}