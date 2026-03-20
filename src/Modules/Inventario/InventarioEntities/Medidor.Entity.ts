import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Afiliado } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoMedidor } from "./EstadoMedidor.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { Expose } from "class-transformer";
import { Lectura } from "src/Modules/Lecturas/LecturaEntities/Lectura.Entity";

@Entity('medidor')
export class Medidor {
    @PrimaryGeneratedColumn()
    Id_Medidor: number;

    @Column({ nullable: false, unique: true })
    Numero_Medidor: number;

    @Column({ nullable: true })
    Id_Solicitud: number; // ID de la solicitud asociada (se asigna antes de crear el afiliado)

    @Column({ nullable: true, type: 'varchar', length: 500 })
    Planos_Terreno: string | null;

    @Column({ nullable: true, type: 'varchar', length: 500 })
    Escritura_Terreno: string | null;

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

    @OneToMany(() => Lectura, lectura => lectura.Medidor, { cascade: true })
    @Expose({ name: 'Lecturas' })
    Lecturas: Lectura[];

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