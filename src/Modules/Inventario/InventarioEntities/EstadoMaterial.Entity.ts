import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material.Entity";

@Entity('Estado_Material')
export class EstadoMaterial {
    @PrimaryGeneratedColumn()
    Id_Estado_Material: number;

    @Column({ nullable: false })
    Nombre_Estado_Material: string;

    @ManyToMany(() => Material, material => material.Estado_Material)
    Materiales: Material[];
}