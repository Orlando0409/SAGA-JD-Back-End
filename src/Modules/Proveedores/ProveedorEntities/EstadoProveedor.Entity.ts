import{ Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Proveedor } from "./Proveedor.Entity";

@Entity('Estado_Proveedor')
export class EstadoProveedor{  
    @PrimaryGeneratedColumn()
    Id_Estado_Proveedor : number;

    @Column({ nullable: false })
    Estado_Proveedor : string;

    //Un estado puede tener varios proveedores
    @OneToMany(() => Proveedor, (proveedor) => proveedor.Estado_Proveedor)
    proveedor: Proveedor[];
}
