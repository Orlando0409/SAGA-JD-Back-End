import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EstadoAfiliado } from "./EstadoAfiliado.Entity";

@Entity('Asociados')
export class Asociado {
    @PrimaryGeneratedColumn()
    Id_Asociado: number;

    @Column({ type: 'varchar', length: 12, nullable: false, unique: true })
    Cedula: string;

    @Column({ nullable: false })
    Nombre: string;

    @Column({ nullable: false })
    Apellido1: string;

    @Column()
    Apellido2: string;

    @Column({ nullable: false })
    Correo: string;

    @Column({ nullable: false })
    Numero_Telefono: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @ManyToOne(() => EstadoAfiliado, estado => estado.Asociados)
    @JoinColumn({ name: 'Id_Estado_Afiliado' })
    Estado: EstadoAfiliado;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;
}
