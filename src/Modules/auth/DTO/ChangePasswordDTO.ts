// DTO/ChangePasswordDTO.ts
import { IsNotEmpty, IsNumber, MinLength, IsString } from 'class-validator';

export class ChangePasswordDTO {
    @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
    @IsNotEmpty({ message: 'El ID del usuario es requerido' })
    UsuarioId: number;

    @IsString({ message: 'La contraseña actual debe ser un texto' })
    @IsNotEmpty({ message: 'La contraseña actual es requerida' })
    Contraseña_Actual: string;

    @IsString({ message: 'La nueva contraseña debe ser un texto' })
    @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    Nueva_Contraseña: string;
}