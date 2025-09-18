import{Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne} from "typeorm";
import { ProveedorEntity } from "./ProveedorEntity";

@Entity()
export class EstadoProveedor{  

    @PrimaryGeneratedColumn()
    Id_EstadoProveedor : number;

    @Column()
    Estado_Proveedor : string;

    //Un estado puede tener varios proveedores
    @OneToMany(() => ProveedorEntity, (proveedor) => proveedor.estadoProveedor)
    proveedor: ProveedorEntity[];
}
