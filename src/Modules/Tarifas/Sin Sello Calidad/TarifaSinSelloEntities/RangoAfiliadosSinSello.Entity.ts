import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('rango_afiliados_sin_sello')
export class RangoAfiliadosSinSello {
    @PrimaryGeneratedColumn()
    Id_Rango_Afiliados!: number;

    @Column({ nullable: false })
    Nombre_Rango!: string;

    @Column({ type: 'int', nullable: false })
    Minimo_Afiliados!: number;

    @Column({ type: 'int', nullable: false })
    Maximo_Afiliados!: number;
}