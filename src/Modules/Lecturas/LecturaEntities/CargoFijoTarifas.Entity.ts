import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Cargo_Fijo_Tarifas')
export class CargoFijoTarifas {
    @PrimaryGeneratedColumn()
    Id_Cargo_Fijo_Tarifa: number;

    @Column({ type: 'int', nullable: false })
    Cargo_Fijo_Por_Mes: number; // Cargo fijo mensual en colones
}