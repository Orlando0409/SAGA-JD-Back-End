import { IsString, IsDate, IsNotEmpty, IsInt, isInt, IsBoolean, isString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../ProyectoEntities/EstadoProyecto.Entity';

export class CrearProyectoDto {
    @IsInt()
    @IsNotEmpty()
    id_Proyecto: number;

    @IsString()
    @IsNotEmpty()
    Titulo: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @Type(() => Date)
    @IsDate()
    fecha_Creacion: Date;

    @Type(() => Date)
    @IsDate()
    fecha_Actualizacion: Date;

    @IsInt()
    @IsNotEmpty()
    Id_Usuario: number;

    @IsInt()
    @IsOptional()
    estado: ProjectStatus;
}