import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MaterialCategoria } from "./MaterialCategoria.Entity";

@Entity('Categoria')
export class Categoria {
    @PrimaryGeneratedColumn()
    Id_Categoria: number;

    @Column({ nullable: false })
    Nombre_Categoria: string;

    @OneToMany(() => MaterialCategoria, materialCategoria => materialCategoria.Categoria)
    @JoinColumn({ name: 'Id_Material' })
    Materiales: MaterialCategoria[];
}