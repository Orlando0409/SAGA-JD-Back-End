import { BeforeInsert, Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EstadoMaterial } from "./EstadoMaterial.Entity";
import { MaterialCategoria } from "./MaterialCategoria.Entity";
import { UnidadMedicion } from "./UnidadMedicion.Entity";
import { Expose } from "class-transformer";
import { EstadoUnidadMedicion } from "./EstadoUnidadMedicion.Entity";

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

    @ManyToOne(() => EstadoMaterial, estadoMaterial => estadoMaterial.Materiales, { eager: true })
    @JoinColumn({ name: 'Id_Estado_Material' })
    Estado_Material: EstadoMaterial;

    @OneToMany(() => MaterialCategoria, materialCategoria => materialCategoria.Material, { cascade: true, eager: true })
    @Expose({ name: 'Categorias' })
    materialCategorias: MaterialCategoria[];

    @ManyToOne(() => UnidadMedicion, unidadMedicion => unidadMedicion.Materiales, { eager: true })
    @JoinColumn({ name: 'Id_Unidad_Medicion' })
    Unidad_Medicion: UnidadMedicion;

    @BeforeInsert()
    setDefaultEstado() { this.Estado_Material = { Id_Estado_Material: 1, Nombre_Estado_Material: 'DISPONIBLE' } as EstadoMaterial; }
}