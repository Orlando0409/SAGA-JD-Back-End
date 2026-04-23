import { Medidor } from "src/Modules/Inventario/InventarioEntities/Medidor.Entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tarifa_lectura_sin_sello')
export class TarifaLecturaSinSello {
    @PrimaryGeneratedColumn()
    Id_Tarifa_Lectura!: number;

    @Column({ nullable: false })
    Nombre_Tipo_Tarifa!: string;

    @Column({ nullable: true })
    Descripcion?: string;

    @Column({ nullable: false })
    Activa!: boolean;

    // Relacion OneToOne con medidor
    // @OneToOne(() => Medidor)
    // @JoinColumn({ name: 'Id_Medidor' })
    // Medidor: Medidor;

}