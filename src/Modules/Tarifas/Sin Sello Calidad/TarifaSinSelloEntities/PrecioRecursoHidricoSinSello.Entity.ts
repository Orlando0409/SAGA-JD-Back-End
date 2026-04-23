import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BloqueRecursoHidricoSinSello } from "./BloqueRecursoHidricoSinSello.Entity";

@Entity('precio_recurso_hidrico_sin_sello')
export class PrecioRecursoHidricoSinSello {
    @PrimaryGeneratedColumn()
    Id_Precio_Recurso_Hidrico!: number;

    @ManyToOne(() => BloqueRecursoHidricoSinSello, { nullable: false })
    @JoinColumn({ name: 'Id_Bloque_Recurso_Hidrico' })
    Bloque_Recurso_Hidrico!: BloqueRecursoHidricoSinSello;

    @Column({ type: 'int', nullable: false })
    Precio_Por_M3!: number;

    @Column({ type: 'boolean', default: true, nullable: false })
    Activo!: boolean;
}
