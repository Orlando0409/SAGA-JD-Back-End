import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Afiliado } from "./Afiliado.Entity";

@Entity('Tipo_Afiliado')
export class TipoAfiliado {
    @PrimaryGeneratedColumn()
    Id_Tipo_Afiliado: number;

    @Column({ type: 'varchar', length: 50, nullable: false })
    Nombre_Tipo_Afiliado: string;

    @OneToMany(() => Afiliado, afiliado => afiliado.Tipo_Afiliado)
    Afiliados: Afiliado[];
}