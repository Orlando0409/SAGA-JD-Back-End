import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MaterialCategoria } from "./MaterialCategoria.Entity";
import { EstadoCategoria } from "./EstadoCategoria.Entity";

@Entity('Categoria')
export class Categoria {
    @PrimaryGeneratedColumn()
    Id_Categoria: number;

    @Column({ nullable: false })
    Nombre_Categoria: string;

    @Column({ nullable: true })
    Descripcion_Categoria?: string;

    @OneToMany(() => EstadoCategoria, estadoCategoria => estadoCategoria.Categorias)
    Estado_Categoria: EstadoCategoria;

    @OneToMany(() => MaterialCategoria, materialCategoria => materialCategoria.Categoria)
    Materiales: MaterialCategoria[];

    @BeforeInsert()
    @BeforeUpdate()
    normalizarDescripcion() {
        if (!this.Descripcion_Categoria || this.Descripcion_Categoria?.trim() === '' || this.Descripcion_Categoria === 'undefined') {
            this.Descripcion_Categoria = 'Descripcion no Proporcionada';
        }
    }
}