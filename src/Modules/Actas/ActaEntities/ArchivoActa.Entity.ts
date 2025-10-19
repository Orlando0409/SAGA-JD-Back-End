import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Acta } from "./Acta.Entity";

@Entity('Archivo_Acta')
export class ArchivoActa
{
    @PrimaryGeneratedColumn()
    Id_Archivo_Acta: number;

    @Column({ nullable: false })
    Url_Archivo: string;

    @ManyToOne(() => Acta, acta => acta.Archivos, { onDelete: 'CASCADE' })
    Acta: Acta;
}