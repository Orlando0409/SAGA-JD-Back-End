import {Injectable, UnauthorizedException} from '@nestjs/common';
import{ UsuariosService } from '../Usuarios/Service/usuarios.service';
import { LoginDTO } from './DTOauth/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';



@Injectable()
export class AutenticacionService {

    constructor(private readonly usuariosService : UsuariosService,
        private readonly jwtService: JwtService
    ){}

  async login({Correo_Electronico ,  Contraseña} : LoginDTO) {

    const user= await this.usuariosService.findOneUserByEmail(Correo_Electronico);

        if(!user){
            throw new UnauthorizedException('El usuario con este correo no existe');
        }

        if (!user.rol) {
            throw new UnauthorizedException('El usuario no posee un rol asignado. No puede iniciar sesión.');
        }
       
        if (!user.rol.permisos || Object.keys(user.rol.permisos).length === 0) {
            throw new UnauthorizedException('El rol no tiene permisos asignados.');
        }

        const hasPermissions = Object.values(user.rol.permisos).some(
            (permisos) => Object.values(permisos as object).some((valor) => valor === true)
        );

        if (!hasPermissions) {
            throw new UnauthorizedException('El rol no tiene permisos activos para iniciar sesión.');
        }

        const isPasswordValid = await bcryptjs.compare(Contraseña, user.Contraseña)

        if(!isPasswordValid){
            throw new UnauthorizedException('La contraseña es incorrecta');
        }

        const payload = {
            sub: user.Id_Usuario,
            Correo_Electronico : user.Correo_Electronico,
            rol: user.rol ? user.rol : null,
            }

        const token = await this.jwtService.signAsync(payload)

       const { Contraseña: userPassword, ...userResponse } = user;

        return {
            token, user: userResponse,
        }; 
    }

}
