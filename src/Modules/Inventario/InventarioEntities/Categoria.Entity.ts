import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MaterialCategoria } from "./MaterialCategoria.Entity";

@Entity('Categoria')
export class Categoria {
    @PrimaryGeneratedColumn()
    Id_Categoria: number;

    @Column({ nullable: false })
    Nombre_Categoria: string;

    @OneToMany(() => MaterialCategoria, materialCategoria => materialCategoria.Categoria)
    Materiales: MaterialCategoria[];
}