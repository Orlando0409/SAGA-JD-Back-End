import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tarifa_hidrante_sin_sello')
export class TarifaHidranteSinSello {
    @PrimaryGeneratedColumn()
    Id_Tarifa_Hidrante!: number;

    @Column({ type: 'int', nullable: false })
    Precio_Hidrante_Por_M3!: number;

    @Column({ type: 'boolean', default: true, nullable: false })
    Activa!: boolean;
}
