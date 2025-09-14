import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn } from "typeorm";
import { EstadoAfiliado } from "./EstadoAfiliado.Entity";
import { TipoAfiliado } from "./TipoAfiliado.Entity";

@Entity('Afiliados')
@TableInheritance({ column: { type: "varchar", name: "Tipo_Afiliado" } })
export abstract class Afiliado {
    @PrimaryGeneratedColumn()
    Id_Afiliado: number;

    @Column({ nullable: false })
    Correo: string;

    @Column({ nullable: false })
    Numero_Telefono: string;

    @Column({ nullable: false })
    Direccion_Exacta: string;

    @Column({ nullable: true })
    Planos_Terreno: string;

    @Column({ nullable: true })
    Escritura_Terreno: string;

    @ManyToOne(() => EstadoAfiliado, estado => estado.Afiliados)
    @JoinColumn({ name: 'Id_Estado_Afiliado' })
    Estado: EstadoAfiliado;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @ManyToOne(() => TipoAfiliado, tipo => tipo.Afiliados)
    @JoinColumn({ name: 'Id_Tipo_Afiliado' })
    Tipo_Afiliado: TipoAfiliado;
}

@Entity('Afiliado_Fisico')
export class AfiliadoFisico extends Afiliado {
@Column({ type: 'varchar', length: 12, nullable: false })
    Cedula: string;

    @Column({ nullable: false })
    Nombre: string;

    @Column({ nullable: false })
    Apellido1: string;

    @Column()
    Apellido2: string;

    @Column({ nullable: false })
    Edad: number;

    @BeforeInsert()
    setDefaultEstado() { this.Estado = { Id_Estado_Afiliado: 1, Nombre_Estado: 'Activo' } as EstadoAfiliado; }

    @BeforeInsert()
    setTipoAfiliado() { this.Tipo_Afiliado = { Id_Tipo_Afiliado: 1, Nombre_Tipo_Afiliado: 'Abonado' } as TipoAfiliado; }
}

@Entity('Afiliado_Juridico')
export class AfiliadoJuridico extends Afiliado {
    @Column({ type: 'varchar', length: 20, nullable: false })
    Cedula_Juridica: string;

    @Column({ nullable: false })
    Razon_Social: string;

    @BeforeInsert()
    setDefaultEstado() { this.Estado = { Id_Estado_Afiliado: 1, Nombre_Estado: 'Activo' } as EstadoAfiliado; }

    @BeforeInsert()
    setTipoAfiliado() { this.Tipo_Afiliado = { Id_Tipo_Afiliado: 1, Nombre_Tipo_Afiliado: 'Abonado' } as TipoAfiliado; }
}