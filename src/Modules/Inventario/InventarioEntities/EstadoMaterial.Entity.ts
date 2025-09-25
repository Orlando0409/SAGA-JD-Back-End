import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material.Entity";

@Entity('Estado_Material')
export class EstadoMaterial {
    @PrimaryGeneratedColumn()
    Id_Estado_Material: number;

    @Column({ nullable: false })
    Nombre_Estado_Material: string;

    @OneToMany(() => Material, material => material.Estado_Material)
    @JoinColumn({ name: 'Id_Material' })
    Materiales: Material[];
}