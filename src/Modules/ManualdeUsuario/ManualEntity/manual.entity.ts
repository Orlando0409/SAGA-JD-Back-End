import { Column, PrimaryGeneratedColumn, Entity } from "typeorm"

@Entity('manuales')
export class ManualEntity {

    @PrimaryGeneratedColumn()
    Id_Manual: number;

    @Column()
    Nombre_Manual: string;

    @Column()
    PDF_Manual: string;
}