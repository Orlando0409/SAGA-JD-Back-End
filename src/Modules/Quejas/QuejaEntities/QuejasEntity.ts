import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { EstadoQueja } from './EstadoQueja';

@Entity('Quejas')
export class Queja {
    @PrimaryGeneratedColumn()
    Id_Queja: number;

    @Column({ nullable: false })
    Nombre: string;

    @Column({ nullable: false })
    Primer_Apellido: string;

    @Column({ nullable: true })
    Segundo_Apellido?: string;

    @Column({ nullable: false })
    Descripcion: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    Correo: string;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasReporte?: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Queja: Date;

    @ManyToOne(() => EstadoQueja)
    @JoinColumn({ name: 'Id_Estado_Queja' })
    Estado: EstadoQueja;
}