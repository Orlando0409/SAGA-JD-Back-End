import { Body, Controller, Post,Get, UseGuards,Request } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { LoginDTO } from './DTOauth/login.dto';
import { AuthGuard } from './Guards/auth.guard';

@Controller('autenticacion')
export class AutenticacionController {

    constructor(private readonly autenticacionService: AutenticacionService){}

    @Post('login')
      login(
        @Body()
        loginDto : LoginDTO,
      ){
        return this.autenticacionService.login(loginDto);
    }  
}



