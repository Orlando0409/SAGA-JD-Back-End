import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoQueja } from './EstadoQueja';

@Entity('quejas')
export class QuejasEntity {
    @PrimaryGeneratedColumn()
    Id_Queja: number;

    @Column()
    Nombre: string;

    @Column()
    Primer_Apellido: string;

    @Column()
    Segundo_Apellido: string;

    @Column()
    Descripcion_Queja: string;

    @Column({ type: 'simple-json', nullable: true })
    Imagen?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasReporte?: string;

    @ManyToOne(() => EstadoQueja)
    @JoinColumn({ name: 'Id_Estado_Queja' })
    Estado: EstadoQueja;

    @Column()
    Fecha_Queja: Date;
}


  



