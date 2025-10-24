import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoQueja } from './EstadoQueja';


@Entity('quejas')
export class Queja {
    @PrimaryGeneratedColumn()
    Id_Queja: number;

    @Column()
    Nombre: string;

    @Column()
    Primer_Apellido: string;

    @Column({ nullable: true })
    Segundo_Apellido?: string;

    @Column()
    Descripcion: string;

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


  



