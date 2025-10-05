import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Entity('Movimiento')
export class MovimientoInventario {
    @PrimaryGeneratedColumn()
    Id_Movimiento: number;

    @Column({ nullable: false })
    Tipo_Movimiento: string;

    @Column({ nullable: false })
    Cantidad: number;

    @Column({ nullable: false })
    Cantidad_Anterior: number;

    @Column({ nullable: false })
    Cantidad_Nueva: number;

    @Column({ nullable: true, length: 250 })
    Observaciones?: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Movimiento: Date;

    @ManyToOne(() => Material, material => material.movimientosInventario)
    @JoinColumn({ name: 'Id_Material' })
    Material: Material;

    @ManyToOne(() => Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario_Creador' })
    Usuario_Creador: Usuario;
}