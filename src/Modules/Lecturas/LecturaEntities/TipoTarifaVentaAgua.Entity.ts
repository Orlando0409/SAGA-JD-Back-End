import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Tabla para almacenar los factores operativos (Conducción, Potabilización, Distribución)
@Entity('Tipo_Tarifa_Venta_Agua')
export class TipoTarifaVentaAgua {
    @PrimaryGeneratedColumn()
    Id_Tipo_Tarifa_Venta_Agua: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    Nombre_Tipo_Tarifa: string; // "Conducción", "Potabilización", "Distribución"

    @Column({ type: 'int', nullable: false })
    Minimo_Afiliados: number;

    @Column({ type: 'int', nullable: false })
    Maximo_Afiliados: number;

    @Column({ type: 'varchar', length: 20, nullable: false })
    Nombre_Rango: string; // "1-100", "101-300", "301-1000", "1000+"

    @Column({ type: 'int', nullable: false })
    Cargo_Por_M3: number; // Costo por M³ en colones
}