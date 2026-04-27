import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { RecursoHidricoSinSello } from "./RecursoHidricoSinSello.Entity";

@Entity('bloque_recurso_hidrico_sin_sello')
export class BloqueRecursoHidricoSinSello {
    @PrimaryGeneratedColumn()
    Id_Bloque_Recurso_Hidrico!: number;

    @ManyToOne(() => RecursoHidricoSinSello, { nullable: false })
    @JoinColumn({ name: 'Id_Recurso_Hidrico' })
    Recurso_Hidrico!: RecursoHidricoSinSello;

    @Column({ type: 'int', nullable: false })
    Minimo_M3!: number;

    @Column({ type: 'int', nullable: false })
    Maximo_M3!: number;

    @Column({ type: 'int', nullable: true })
    Orden?: number;
}
