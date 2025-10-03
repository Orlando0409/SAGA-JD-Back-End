import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EstadoMaterial } from "./EstadoMaterial.Entity";
import { MaterialCategoria } from "./MaterialCategoria.Entity";
import { UnidadMedicion } from "./UnidadMedicion.Entity";
import { IngresoEgresoMaterial } from "./IngresoEgreso.Entity";
import { Expose } from "class-transformer";
import { UserEntity } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

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

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Entrada: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

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

    @ManyToOne(() => UserEntity, usuario => usuario.Id_Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario_Creador' })
    Usuario_Creador: UserEntity;

    @OneToMany(() => IngresoEgresoMaterial, ingresoEgreso => ingresoEgreso.Material)
    movimientosInventario: IngresoEgresoMaterial[];

    @BeforeInsert()
    setDefaultEstado() { this.Estado_Material = { Id_Estado_Material: 1, Nombre_Estado_Material: 'DISPONIBLE' } as EstadoMaterial; }
}