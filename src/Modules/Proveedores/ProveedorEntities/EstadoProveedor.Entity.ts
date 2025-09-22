import{ Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ProveedorEntity } from "./Proveedor.Entity";

@Entity('Estado_Proveedor')
export class EstadoProveedor{  
    @PrimaryGeneratedColumn()
    Id_Estado_Proveedor : number;

    @Column()
    Estado_Proveedor : string;

    //Un estado puede tener varios proveedores
    @OneToMany(() => ProveedorEntity, (proveedor) => proveedor.Estado_Proveedor)
    proveedor: ProveedorEntity[];
}
