import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('consulta_pagos')
export class Consulta_Pago {
    @PrimaryGeneratedColumn()
    Id_Consulta_Pago: number;

    @Column({ type: 'enum', enum: TipoIdentificacion, nullable: true })
    Tipo_Identificacion?: TipoIdentificacion;

    @Column({ nullable: true })
    Identificacion?: string;

    @Column({ nullable: true })
    Cedula_Juridica?: string;

    @Column({ type: 'int', nullable: true })
    Numero_Medidor?: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Consulta: Date;
}