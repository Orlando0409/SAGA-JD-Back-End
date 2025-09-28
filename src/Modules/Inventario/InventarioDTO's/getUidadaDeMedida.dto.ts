import { Expose } from "class-transformer";

export class getUnidadDeMedidaDTO {
    @Expose()
    Id_Unidad_Medicion: number;

    @Expose()
    Nombre_Unidad_Medicion: string;
 }