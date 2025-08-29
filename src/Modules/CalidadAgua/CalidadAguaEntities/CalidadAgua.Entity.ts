import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Calidad_Agua')
export class CalidadAgua
{
    @PrimaryGeneratedColumn()
    Id_Calidad_Agua: number;

    @Column({ nullable: false })
    Titulo: string;

    @Column({ nullable: false })
    Url_Archivo: string;
}