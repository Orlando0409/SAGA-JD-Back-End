import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('aplicar_sello_calidad')
export class AplicarSelloCalidad {
    @PrimaryGeneratedColumn()
    Id_Aplicar_Sello_Calidad: number;

    @Column({ type: 'boolean', nullable: false })
    Aplicar_Sello_Calidad: boolean;
}
