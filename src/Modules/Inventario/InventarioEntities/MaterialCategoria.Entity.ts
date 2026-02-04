import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material.Entity";
import { Categoria } from "./Categoria.Entity";

@Entity('material_categoria')
export class MaterialCategoria {
    @PrimaryGeneratedColumn()
    Id_Material_Categoria: number;

    @ManyToOne(() => Material, material => material.materialCategorias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'Id_Material' })
    Material: Material;

    @ManyToOne(() => Categoria, categoria => categoria.Materiales, { eager: true })
    @JoinColumn({ name: 'Id_Categoria' })
    Categoria: Categoria;
}