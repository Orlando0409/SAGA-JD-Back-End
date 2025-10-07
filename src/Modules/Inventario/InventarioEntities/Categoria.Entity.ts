import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MaterialCategoria } from "./MaterialCategoria.Entity";
import { EstadoCategoria } from "./EstadoCategoria.Entity";
import { Usuario } from "../../Usuarios/UsuarioEntities/Usuario.Entity";

@Entity('Categoria')
export class Categoria {
    @PrimaryGeneratedColumn()
    Id_Categoria: number;

    @Column({ nullable: false })
    Nombre_Categoria: string;

    @Column({ nullable: true })
    Descripcion_Categoria?: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Creacion: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
    Fecha_Actualizacion: Date;

    @ManyToOne(() => EstadoCategoria, estadoCategoria => estadoCategoria.Categorias, { eager: true })
    @JoinColumn({ name: 'Id_Estado_Categoria' })
    Estado_Categoria: EstadoCategoria;

    @ManyToOne(() => Usuario, usuario => usuario.Id_Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario_Creador' })
    Usuario_Creador: Usuario;

    @OneToMany(() => MaterialCategoria, materialCategoria => materialCategoria.Categoria)
    Materiales: MaterialCategoria[];

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultEstadoCategoria() {
        if (!this.Estado_Categoria) {
            this.Estado_Categoria = { Id_Estado_Categoria: 1 } as EstadoCategoria;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    normalizarDescripcion() {
        if (!this.Descripcion_Categoria || this.Descripcion_Categoria?.trim() === '' || this.Descripcion_Categoria === 'undefined') {
            this.Descripcion_Categoria = 'Descripcion no Proporcionada';
        }
    }
}