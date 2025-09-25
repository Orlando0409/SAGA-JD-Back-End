import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EstadoMaterial } from "./EstadoMaterial.Entity";
import { CategoriaMaterial } from "./CategoriaMaterial.Entity";

@Entity('Material')
export class Material {
    @PrimaryGeneratedColumn()
    Id_Material: number;

    @Column({ nullable: false })
    Nombre_Material: string;

    @Column({ nullable: true })
    Descripcion?: string;

    @Column({ nullable: false })
    Cantidad: number;

    @Column({ nullable: false })
    Precio_Unitario: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Entrada: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @Column({ type: 'datetime', precision: 0, nullable: true })
    Fecha_Salida: Date;

    @ManyToOne(() => EstadoMaterial, estadoMaterial => estadoMaterial.Materiales)
    Estado_Material: EstadoMaterial;

    @ManyToMany(() => CategoriaMaterial, categoriaMaterial => categoriaMaterial.Materiales, { nullable: true })
    @JoinTable()
    Categorias: CategoriaMaterial[];

    @BeforeInsert()
    setDefaultEstado() { this.Estado_Material = { Id_Estado_Material: 1, Nombre_Estado_Material: 'DISPONIBLE' } as EstadoMaterial; }
}