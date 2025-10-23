import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoQueja } from './EstadoQueja.Entity';

@Entity('Quejas')
export class Queja {
    @PrimaryGeneratedColumn()
    Id_Queja: number;

    @Column({ nullable: false })
    Nombre: string;

    @Column({ nullable: false })
    Primer_Apellido: string;

    @Column({ nullable: false })
    Segundo_Apellido: string;

    @Column({ nullable: false })
    Descripcion: string;

    @Column({ type: 'varchar', length: 100 })
    Correo: string;

    @Column({ nullable: false, type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Queja: Date;

    @Column({ type: 'text', nullable: true })
    Respuesta_Queja?: string;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @ManyToOne(() => EstadoQueja)
    @JoinColumn({ name: 'Id_Estado_Queja' })
    Estado: EstadoQueja;
}