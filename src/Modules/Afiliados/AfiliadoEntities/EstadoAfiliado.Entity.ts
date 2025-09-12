import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Afiliado } from "./Afiliado.Entity";

@Entity('Estado_Afiliado')
export class EstadoAfiliado {
    @PrimaryGeneratedColumn()
    Id_Estado_Afiliado: number;

    @Column({ type: 'varchar', length: 50, nullable: false })
    Nombre_Estado: string;

    @OneToMany(() => Afiliado, afiliado => afiliado.Estado)
    Afiliados: Afiliado[];
}
