import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material.Entity";

@Entity('Categoria_Material')
export class CategoriaMaterial {
    @PrimaryGeneratedColumn()
    Id_Categoria_Material: number;

    @Column({ nullable: false })
    Nombre_Categoria_Material: string;

    @ManyToOne(() => Material, material => material.Categoria, { nullable: true })
    Categoria_Material: Material;
}