import{Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne} from "typeorm";
import { ProveedorEntity } from "./ProveedorEntity";

@Entity()
export class EstadoProveedor{  

    @PrimaryGeneratedColumn()
    Id_Estado_Proveedor : number;

    @Column()
    Estado_Proveedor : string;

    //Un estado puede tener varios proveedores
    @OneToMany(() => ProveedorEntity, (proveedor) => proveedor.Estado_Proveedor)
    proveedor: ProveedorEntity[];
}
