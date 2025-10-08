import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EstadoMaterial } from "./EstadoMaterial.Entity";
import { MaterialCategoria } from "./MaterialCategoria.Entity";
import { UnidadMedicion } from "./UnidadMedicion.Entity";
import { MovimientoInventario } from "./Movimiento.Entity";
import { MaterialProveedor } from "./MaterialProveedor.Entity";
import { Expose } from "class-transformer";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

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

    @Column({ name: 'Fecha_Baja', type: 'datetime', precision: 0, nullable: true })
    Ultima_Fecha_Baja: Date;

    @ManyToOne(() => EstadoMaterial, estadoMaterial => estadoMaterial.Materiales, { eager: true })
    @JoinColumn({ name: 'Id_Estado_Material' })
    Estado_Material: EstadoMaterial;

    @OneToMany(() => MaterialCategoria, materialCategoria => materialCategoria.Material, { cascade: true, eager: true })
    @Expose({ name: 'Categorias' })
    materialCategorias: MaterialCategoria[];

    @ManyToOne(() => UnidadMedicion, unidadMedicion => unidadMedicion.Materiales, { eager: true })
    @JoinColumn({ name: 'Id_Unidad_Medicion' })
    Unidad_Medicion: UnidadMedicion;

    @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario_Creador' })
    Usuario_Creador: Usuario;

    @OneToMany(() => MaterialProveedor, materialProveedor => materialProveedor.Material, { cascade: true, eager: true })
    @Expose({ name: 'Proveedores' })
    materialProveedores: MaterialProveedor[];

    @OneToMany(() => MovimientoInventario, movimiento => movimiento.Material)
    movimientosInventario: MovimientoInventario[];

    @BeforeInsert()
    setDefaultEstado() { this.Estado_Material = { Id_Estado_Material: 1 } as EstadoMaterial; }
}