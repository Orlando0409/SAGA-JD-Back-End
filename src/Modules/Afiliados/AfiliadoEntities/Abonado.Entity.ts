import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EstadoAfiliado } from "./EstadoAfiliado.Entity";

@Entity('Abonados')
export class Abonado {
    @PrimaryGeneratedColumn()
    Id_Abonado: number;

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
    Direccion_Exacta: string;

    @Column({ nullable: false })
    Edad: number;

    @Column({ nullable: true })
    Planos_Terreno: string;

    @Column({ nullable: true })
    Escritura_Terreno: string;

    @ManyToOne(() => EstadoAfiliado, estado => estado.Abonados)
    @JoinColumn({ name: 'Id_Estado_Afiliado' })
    Estado: EstadoAfiliado;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;
}
