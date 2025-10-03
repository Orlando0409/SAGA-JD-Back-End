import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material.Entity";
import { UserEntity } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Entity('Ingreso_Egreso')
export class IngresoEgresoMaterial {
    @PrimaryGeneratedColumn()
    Id_Ingreso_Egreso: number;

    @Column({ nullable: false })
    Tipo_Movimiento: string;

    @Column({ nullable: false })
    Cantidad: number;

    @Column({ nullable: false })
    Cantidad_Anterior: number;

    @Column({ nullable: false })
    Cantidad_Nueva: number;

    @Column({ nullable: true, length: 500 })
    Observaciones?: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Movimiento: Date;

    // Relación con Material
    @ManyToOne(() => Material, material => material.movimientosInventario)
    @JoinColumn({ name: 'Id_Material' })
    Material: Material;

    // Relación con Usuario (quién realizó el movimiento)
    @ManyToOne(() => UserEntity, { eager: true })
    @JoinColumn({ name: 'Id_Usuario_Creador' })
    Usuario_Creador: UserEntity;
}