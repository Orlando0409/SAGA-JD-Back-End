import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EstadoMaterial } from "./EstadoMaterial.Entity";
import { CategoriaMaterial } from "./CategoriaMaterial.Entity";

@Entity('Material')
export class Material {
    @PrimaryGeneratedColumn()
    Id_Material: number;

    @Column({ nullable: false })
    Nombre_Material: string;

    @Column({ nullable: false })
    Descripcion: string;

    @Column({ nullable: false })
    Cantidad: number;

    @Column({ nullable: false })
    Precio_Unitario: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Entrada: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0, nullable: true })
    Fecha_Salida: Date;

    @OneToMany(() => EstadoMaterial, estadoMaterial => estadoMaterial.Materiales)
    Estado_Material: EstadoMaterial[];

    @OneToMany(() => CategoriaMaterial, categoriaMaterial => categoriaMaterial.Categoria_Material, { nullable: true })
    Categoria: CategoriaMaterial[];
}