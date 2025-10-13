import { Expose } from 'class-transformer';

export class GetUsuarioCreadorDto {
    @Expose()
    Id_Usuario: number;

    @Expose()
    Nombre_Usuario: string;

    @Expose()
    Id_Rol: number;

    @Expose()
    Nombre_Rol: string;
}