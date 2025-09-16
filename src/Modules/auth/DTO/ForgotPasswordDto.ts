import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty( { message: 'El correo electrónico es requerido' })
  @IsEmail()
  Email: string;
}