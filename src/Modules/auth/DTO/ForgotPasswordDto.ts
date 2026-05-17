import { IsNotEmpty, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty( { message: 'El correo electrónico es requerido' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'El correo electrónico no es válido' })
  Email: string;
}
