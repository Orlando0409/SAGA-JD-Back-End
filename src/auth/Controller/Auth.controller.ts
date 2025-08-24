import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Public } from '../Decorator/Public.decorator';
import { ForgotPasswordDto } from '../DTO/ForgotPasswordDto';
import { LoginDto } from '../DTO/LoginDto';
import { JwtAuthGuard } from '../Guard/JwtGuard';
import { AuthService } from '../Service/Auth.service';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    return await this.authService.login(loginDto, response);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token de acceso' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = request.cookies?.refreshToken;
    
    if (!refreshToken) {
      throw new Error('Refresh token no encontrado');
    }

    return this.authService.refresh(refreshToken, response);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Recuperar contraseña' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.Email);
  }


  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  async getCurrentUser(@Req() req) {
    const usuario = req.user; // El usuario viene del JwtAuthGuard
    return this.authService.getUserProfile(usuario.Id_Usuario);
  }
}