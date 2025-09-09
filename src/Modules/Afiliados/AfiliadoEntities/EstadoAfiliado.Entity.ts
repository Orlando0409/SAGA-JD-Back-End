import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Abonado } from "./Abonado.Entity";
import { Asociado } from "./Asociado.Entity";

@Entity('Estado_Afiliado')
export class EstadoAfiliado {
    @PrimaryGeneratedColumn()
    Id_Estado_Afiliado: number;

    @Column({ type: 'varchar', length: 50, nullable: false })
    Nombre_Estado: string;

    @OneToMany(() => Abonado, abonado => abonado.Estado)
    Abonados: Abonado[];

    @OneToMany(() => Asociado, asociado => asociado.Estado)
    Asociados: Asociado[];
}
