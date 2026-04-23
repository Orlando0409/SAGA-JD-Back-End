import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TarifaLecturaSinSello } from "./TarifaLecturaSinSello.Entity";
import { RangoConsumoSinSello } from "./RangoConsumoSinSello.Entity";
import { RangoAfiliadosSinSello } from "./RangoAfiliadosSinSello.Entity";

@Entity('precio_bloque_consumo_sin_sello')
export class PrecioBloqueConsumoSinSello {
    @PrimaryGeneratedColumn()
    Id_Precio_Bloque!: number;

    @ManyToOne(() => TarifaLecturaSinSello, { nullable: false })
    @JoinColumn({ name: 'Id_Tarifa_Lectura' })
    Tipo_Tarifa!: TarifaLecturaSinSello;

    @ManyToOne(() => RangoConsumoSinSello, { nullable: false })
    @JoinColumn({ name: 'Id_Rango_Consumo' })
    Rango_Consumo!: RangoConsumoSinSello;

    @ManyToOne(() => RangoAfiliadosSinSello, { nullable: false })
    @JoinColumn({ name: 'Id_Rango_Afiliados' })
    Rango_Afiliados!: RangoAfiliadosSinSello;

    @Column({ type: 'int', nullable: false })
    Precio_Por_M3!: number;

    @Column({ type: 'boolean', default: true, nullable: false })
    Activo!: boolean;
}
