import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoQueja } from './EstadoQueja';

@Entity('quejas')
export class QuejasEntity {
    @PrimaryGeneratedColumn()
    Id_Queja: number;

    @Column()
    name: string;

    @Column()
    Papellido: string;

    @Column({ nullable: true })
    Sapellido?: string;

    @Column()
    descripcion: string;

    @Column({ type: 'varchar', length: 100 })
    Correo: string;

    @Column({ type: 'simple-json', nullable: true })
    Adjunto?: string[];

    @Column({ type: 'text', nullable: true })
    RespuestasReporte?: string;

    @ManyToOne(() => EstadoQueja)
    @JoinColumn({ name: 'Id_Estado_Queja' })
    Estado: EstadoQueja;

    @Column()
    Fecha_Queja: Date;
}


  