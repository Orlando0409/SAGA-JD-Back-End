import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Acta } from "./Actas.Entity";

@Entity('archivo_acta')
export class ArchivoActa
{
    @PrimaryGeneratedColumn()
    Id_Archivo_Acta: number;

    @Column({ nullable: false })
    Url_Archivo: string;

    @ManyToOne(() => Acta, acta => acta.Archivos, { onDelete: 'CASCADE' })
    Acta: Acta;
}