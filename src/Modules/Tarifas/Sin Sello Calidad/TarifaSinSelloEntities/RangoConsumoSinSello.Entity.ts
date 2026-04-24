import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TarifaLecturaSinSello } from "./TarifaLecturaSinSello.Entity";

@Entity('rango_consumo_sin_sello')
export class RangoConsumoSinSello {
    @PrimaryGeneratedColumn()
    Id_Rango_Consumo!: number;

    @ManyToOne(() => TarifaLecturaSinSello, { nullable: false })
    @JoinColumn({ name: 'Id_Tarifa_Lectura' })
    Tipo_Tarifa!: TarifaLecturaSinSello;

    @Column({ type: 'int', nullable: false })
    Minimo_M3!: number;

    @Column({ type: 'int', nullable: false })
    Maximo_M3!: number;

    @Column({ type: 'int', nullable: true })
    Orden?: number;
}