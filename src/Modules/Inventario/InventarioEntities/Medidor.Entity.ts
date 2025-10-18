import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Afiliado } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoMedidor } from "./EstadoMedidor.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Entity('Medidor')
export class Medidor {
    @PrimaryGeneratedColumn()
    Id_Medidor: number;

    @Column({ nullable: false, unique: true })
    Numero_Medidor: number;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @ManyToOne(() => EstadoMedidor, estadoMedidor => estadoMedidor.Medidores, { eager: true, nullable: false })
    @JoinColumn({ name: 'Id_Estado_Medidor' })
    Estado_Medidor: EstadoMedidor;

    @ManyToOne(() => Afiliado, afiliado => afiliado.Medidores, { eager: true })
    @JoinColumn({ name: 'Id_Afiliado' })
    Afiliado: Afiliado;

    @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario' })
    Usuario: Usuario;

    @BeforeInsert()
    setDefaultEstado() {
        if (!this.Estado_Medidor) {
            this.Estado_Medidor = { Id_Estado_Medidor: 1 } as EstadoMedidor;
        }
    }
}