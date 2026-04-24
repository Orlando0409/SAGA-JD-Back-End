import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Afiliado } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { Lectura } from "src/Modules/Lecturas/LecturaEntities/Lectura.Entity";
import { EstadoFactura } from "./EstadoFactura.Entity";

@Entity('factura')
export class Factura {
    @PrimaryGeneratedColumn()
    Id_Factura!: number;

    // Número de factura secuencial para mostrar al usuario (ej: FACT-2025-00001)
    @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
    Numero_Factura!: string;

    @ManyToOne(() => Afiliado, { nullable: false, eager: true })
    @JoinColumn({ name: 'Id_Afiliado' })
    Afiliado!: Afiliado;

    @OneToOne(() => Lectura, { nullable: false, eager: true })
    @JoinColumn({ name: 'Id_Lectura' })
    Lectura!: Lectura;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, comment: 'Consumo en M³ (copiado de lectura)' })
    Consumo_M3!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, comment: 'Cargo fijo según rango de afiliados al momento de emisión' })
    Cargo_Fijo!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, comment: 'Cargo por consumo de agua calculado con tarifas vigentes' })
    Cargo_Consumo!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Cargo por recurso hídrico (si aplica)' })
    Cargo_Recurso_Hidrico?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Otros cargos adicionales' })
    Otros_Cargos?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, comment: 'Subtotal antes de impuestos' })
    Subtotal!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: false, comment: 'IVA u otros impuestos' })
    Impuestos!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, comment: 'Total a pagar (inmutable)' })
    Total!: number;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Emision!: Date;

    @Column({ type: 'datetime', nullable: false, comment: 'Fecha límite de pago' })
    Fecha_Vencimiento!: Date;

    @ManyToOne(() => EstadoFactura, estado => estado.Facturas, { nullable: false, eager: true })
    @JoinColumn({ name: 'Id_Estado_Factura' })
    Estado!: EstadoFactura;

    @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Tipo de tarifa aplicada en el momento de facturación' })
    Tipo_Tarifa_Aplicada?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Nombre completo o razón social del afiliado al momento de facturación' })
    Nombre_Completo_Afiliado?: string;

    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Identificación o cédula jurídica del afiliado al momento de facturación' })
    Identificacion_Afiliado?: string;

    @Column({ type: 'text', nullable: true, comment: 'Observaciones o notas adicionales' })
    Observaciones?: string;
}