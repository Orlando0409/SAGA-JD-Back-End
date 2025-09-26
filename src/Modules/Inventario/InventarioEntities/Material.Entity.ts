import { BeforeInsert, Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EstadoMaterial } from "./EstadoMaterial.Entity";
import { MaterialCategoria } from "./MaterialCategoria.Entity";
import { join } from "path";
import { Expose } from "class-transformer";

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

    @DeleteDateColumn({ name: 'Fecha_Baja', type: 'datetime', precision: 0, nullable: true })
    Fecha_Baja: Date;

    @Column({ nullable: true })
    Id_Estado_Material: number;

    @ManyToOne(() => EstadoMaterial, estadoMaterial => estadoMaterial.Materiales, { eager: true })
    @JoinColumn({ name: 'Id_Estado_Material' })
    Estado_Material: EstadoMaterial;

    @OneToMany(() => MaterialCategoria, materialCategoria => materialCategoria.Material, { cascade: true, eager: true })
    @Expose({ name: 'Categorias' })
    materialCategorias: MaterialCategoria[];

    @BeforeInsert()
    setDefaultEstado() { this.Estado_Material = { Id_Estado_Material: 1, Nombre_Estado_Material: 'DISPONIBLE' } as EstadoMaterial; }
}