import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('recurso_hidrico_sin_sello')
export class RecursoHidricoSinSello {
    @PrimaryGeneratedColumn()
    Id_Recurso_Hidrico!: number;

    @Column({ nullable: false })
    Nombre!: string;

    @Column({ type: 'boolean', default: true, nullable: false })
    Activo!: boolean;
}
