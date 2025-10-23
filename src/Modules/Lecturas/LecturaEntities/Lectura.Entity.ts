import { Medidor } from "src/Modules/Inventario/InventarioEntities/Medidor.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Lectura')
export class Lectura {
    @PrimaryGeneratedColumn()
    Id_Lectura: number;

    @ManyToOne(() => Medidor, medidor => medidor.Lecturas, { nullable: false })
    @JoinColumn({ name: 'Id_Medidor' })
    Medidor: Medidor;

    @Column({ type: 'float', nullable: false, default: 0, comment: 'Lectura anterior del medidor' })
    Valor_Lectura_Anterior: number;

    @Column({ type: 'float', nullable: false, comment: 'Lectura actual del medidor' })
    Valor_Lectura_Actual: number;

    @Column({ type: 'float', nullable: false, comment: 'Consumo calculado (diferencia entre lectura actual y anterior)' })
    Consumo_Calculado: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Lectura: Date;

    @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario' })
    Usuario: Usuario;
}