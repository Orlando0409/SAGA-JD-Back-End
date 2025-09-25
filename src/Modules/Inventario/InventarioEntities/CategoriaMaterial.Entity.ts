import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material.Entity";

@Entity('Categoria_Material')
export class CategoriaMaterial {
    @PrimaryGeneratedColumn()
    Id_Categoria_Material: number;

    @Column({ nullable: false })
    Nombre_Categoria_Material: string;

    @ManyToMany(() => Material, material => material.Categorias, { nullable: true })
    Materiales: Material[];
}