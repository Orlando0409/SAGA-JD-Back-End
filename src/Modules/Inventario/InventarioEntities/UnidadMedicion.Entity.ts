import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Material } from "./Material.Entity";
import { EstadoUnidadMedicion } from "./EstadoUnidadMedicion.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Entity('Unidades_Medicion')
export class UnidadMedicion {
    @PrimaryGeneratedColumn()
    Id_Unidad_Medicion: number;

    @Column({ nullable: false })
    Nombre_Unidad: string;

    @Column({ nullable: false })
    Abreviatura: string;

    @Column({ nullable: true })
    Descripcion?: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @ManyToOne(() => EstadoUnidadMedicion, estadoUnidadMedicion => estadoUnidadMedicion.UnidadesMedicion, { eager: true })
    @JoinColumn({ name: 'Id_Estado_Unidad_Medicion' })
    Estado_Unidad_Medicion: EstadoUnidadMedicion;

    @OneToMany(() => Material, material => material.Unidad_Medicion)
    Materiales: Material[];

    @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario_Creador' })
    Usuario: Usuario;


    @BeforeInsert()
    setDefaultEstadoUnidadMedicion() { this.Estado_Unidad_Medicion = { Id_Estado_Unidad_Medicion: 1 } as EstadoUnidadMedicion; }
}