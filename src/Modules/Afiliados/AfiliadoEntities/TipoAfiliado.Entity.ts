import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Abonado } from "./Abonado.Entity";
import { Asociado } from "./Asociado.Entity";

@Entity('Tipo_Afiliado')
export class TipoAfiliado {
    @PrimaryGeneratedColumn()
    Id_Tipo_Afiliado: number;

    @Column({ type: 'varchar', length: 50, nullable: false })
    Nombre_Tipo_Afiliado: string;

    @OneToMany(() => Abonado, abonado => abonado.Tipo_Afiliado)
    Abonados: Abonado[];

    @OneToMany(() => Asociado, asociado => asociado.Tipo_Afiliado)
    Asociados: Asociado[];
}