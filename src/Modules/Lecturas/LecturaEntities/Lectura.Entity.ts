import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Medidor } from "src/Modules/Inventario/InventarioEntities/Medidor.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { TipoTarifaLectura } from "./TipoTarifaLectura.Entity";

@Entity('lectura')
export class Lectura {
    @PrimaryGeneratedColumn()
    Id_Lectura: number;

    @ManyToOne(() => Medidor, medidor => medidor.Lecturas, { nullable: false })
    @JoinColumn({ name: 'Id_Medidor' })
    Medidor: Medidor;

    @ManyToOne(() => TipoTarifaLectura, tipoTarifa => tipoTarifa.Lectura, { nullable: false })
    @JoinColumn({ name: 'Id_Tipo_Tarifa_Lectura' })
    Tipo_Tarifa: TipoTarifaLectura;

    @Column({ type: 'float', nullable: false, default: 0, comment: 'Lectura anterior del medidor' })
    Valor_Lectura_Anterior: number;

    @Column({ type: 'float', nullable: false, comment: 'Lectura actual del medidor' })
    Valor_Lectura_Actual: number;

    @Column({ type: 'float', nullable: false, comment: 'Consumo calculado (diferencia entre lectura actual y anterior)' })
    Consumo_Calculado_M3: number;

    @Column({ type: 'int', nullable: false })
    Total_A_Pagar: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Lectura: Date;

    @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario' })
    Usuario: Usuario;
}