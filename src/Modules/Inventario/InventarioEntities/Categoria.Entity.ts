import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MaterialCategoria } from "./MaterialCategoria.Entity";
import { EstadoCategoria } from "./EstadoCategoria.Entity";
import { UserEntity } from "../../Usuarios/UsuarioEntities/Usuario.Entity";

@Entity('Categoria')
export class Categoria {
    @PrimaryGeneratedColumn()
    Id_Categoria: number;

    @Column({ nullable: false })
    Nombre_Categoria: string;

    @Column({ nullable: true })
    Descripcion_Categoria?: string;

    @ManyToOne(() => EstadoCategoria, estadoCategoria => estadoCategoria.Categorias, { eager: true })
    @JoinColumn({ name: 'Id_Estado_Categoria' })
    Estado_Categoria: EstadoCategoria;

    @ManyToOne(() => UserEntity, usuario => usuario.Id_Usuario, { eager: true })
    @JoinColumn({ name: 'Id_Usuario_Creador' })
    Usuario_Creador: UserEntity;

    @OneToMany(() => MaterialCategoria, materialCategoria => materialCategoria.Categoria)
    Materiales: MaterialCategoria[];

    @BeforeInsert()
    @BeforeUpdate()
    setDefaultEstadoCategoria() { this.Estado_Categoria = { Id_Estado_Categoria: 1 } as EstadoCategoria; }

    @BeforeInsert()
    @BeforeUpdate()
    normalizarDescripcion() {
        if (!this.Descripcion_Categoria || this.Descripcion_Categoria?.trim() === '' || this.Descripcion_Categoria === 'undefined') {
            this.Descripcion_Categoria = 'Descripcion no Proporcionada';
        }
    }
}