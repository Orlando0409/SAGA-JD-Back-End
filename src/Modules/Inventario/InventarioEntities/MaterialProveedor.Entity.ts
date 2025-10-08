import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Material } from './Material.Entity';

@Entity('Material_Proveedor')
export class MaterialProveedor {
    @PrimaryGeneratedColumn()
    Id_Material_Proveedor: number;

    @ManyToOne(() => Material, material => material.materialProveedores, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'Id_Material' })
    Material: Material;

    @Column({ name: 'Id_Proveedor' })
    Id_Proveedor: number;

    @Column({ name: 'Tipo_Proveedor' })
    Tipo_Proveedor: number; // 1 para físico, 2 para jurídico
}