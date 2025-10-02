import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Categoria } from "./Categoria.Entity";

@Entity('Estado_Categoria')
export class EstadoCategoria {
    @PrimaryGeneratedColumn()
    Id_Estado_Categoria: number;

    @Column({ nullable: false })
    Nombre_Estado_Categoria: string;

    @OneToMany(() => Categoria, categoria => categoria.Estado_Categoria)
    Categorias: Categoria[];
}