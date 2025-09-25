import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ArchivoActa } from "./ArchivoActa.Entity";

@Entity('Acta')
export class Acta
{
    @PrimaryGeneratedColumn()
    Id_Acta: number;

    @Column({ nullable: false })
    Id_Usuario: number;

    @Column({ nullable: false })
    Titulo: string;

    @Column({ nullable: false })
    Descripcion: string;

    @CreateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @OneToMany(() => ArchivoActa, archivoActa => archivoActa.Acta, { cascade: true, eager: true })
    Archivos: ArchivoActa[];
}