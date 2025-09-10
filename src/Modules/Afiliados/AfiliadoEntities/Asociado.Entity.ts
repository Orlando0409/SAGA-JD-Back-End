import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn } from "typeorm";
import { EstadoAfiliado } from "./EstadoAfiliado.Entity";
import { TipoAfiliado } from "./TipoAfiliado.Entity";

@Entity('Asociados')
@TableInheritance({ column: { type: "varchar", name: "Tipo_Afiliado" } })
export abstract class Asociado {
    @PrimaryGeneratedColumn()
    Id_Asociado: number;

    @Column({ nullable: false })
    Correo: string;

    @Column({ nullable: false })
    Numero_Telefono: string;

    @Column({ nullable: false })
    Motivo_Solicitud: string;

    @ManyToOne(() => EstadoAfiliado, estado => estado.Asociados)
    @JoinColumn({ name: 'Id_Estado_Afiliado' })
    Estado: EstadoAfiliado;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @ManyToOne(() => TipoAfiliado, tipo => tipo.Asociados)
    @JoinColumn({ name: 'Id_Tipo_Afiliado' })
    Tipo_Afiliado: TipoAfiliado;
}

@Entity('Asociado_Fisico')
export class AsociadoFisico extends Asociado {
    @Column({ type: 'varchar', length: 12, nullable: false })
    Cedula: string;

    @Column({ nullable: false })
    Nombre: string;

    @Column({ nullable: false })
    Apellido1: string;

    @Column()
    Apellido2: string;

    @BeforeInsert()
    setDefaultEstado() { this.Estado = { Id_Estado_Afiliado: 1, Nombre_Estado: 'Activo' } as EstadoAfiliado; }

    @BeforeInsert()
    setTipoAfiliado() { this.Tipo_Afiliado = { Id_Tipo_Afiliado: 2, Nombre_Tipo_Afiliado: 'Asociado' } as TipoAfiliado; }
}

@Entity('Asociado_Juridico')
export class AsociadoJuridico extends Asociado {
    @Column({ type: 'varchar', length: 20, nullable: false})
    Cedula_Juridica: string;

    @Column({ nullable: false })
    Razon_Social: string;

    @BeforeInsert()
    setDefaultEstado() { this.Estado = { Id_Estado_Afiliado: 1, Nombre_Estado: 'Activo' } as EstadoAfiliado; }

    @BeforeInsert()
    setTipoAfiliado() { this.Tipo_Afiliado = { Id_Tipo_Afiliado: 2, Nombre_Tipo_Afiliado: 'Asociado' } as TipoAfiliado; }
}