import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EstadoMaterial } from "./EstadoMaterial.Entity";
import { MaterialCategoria } from "./MaterialCategoria.Entity";
import { Categoria } from "./Categoria.Entity";
import { Transform, Expose, Exclude } from "class-transformer";

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

    @ManyToOne(() => EstadoMaterial, estadoMaterial => estadoMaterial.Materiales, { eager: true })
    @JoinColumn({ name: 'Id_Estado_Material' })
    Estado_Material: EstadoMaterial;

    @OneToMany(() => MaterialCategoria, materialCategoria => materialCategoria.Material, { cascade: true, eager: true })
    @Exclude() // Excluir el campo privado de la serialización
    private _Categorias: MaterialCategoria[];

    // Getter personalizado que transforma las categorías
    @Expose({ name: 'Categorias' }) // Exponer con el nombre correcto
    @Transform(({ value, obj }) => {
        return obj._Categorias?.map(mc => mc.Categoria) || [];
    })
    get Categorias(): Categoria[] {
        return this._Categorias?.map(mc => mc.Categoria) || [];
    }

    // Setter para cuando necesites asignar categorías
    set Categorias(categorias: MaterialCategoria[]) {
        this._Categorias = categorias;
    }

    @BeforeInsert()
    setDefaultEstado() { this.Estado_Material = { Id_Estado_Material: 1, Nombre_Estado_Material: 'DISPONIBLE' } as EstadoMaterial; }
}