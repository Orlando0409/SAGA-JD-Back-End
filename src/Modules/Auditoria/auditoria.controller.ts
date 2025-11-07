import { Controller, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { AuditoriaService } from "./auditoria.service";
import { ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/Guard/JwtGuard";
import { GetUser } from "../auth/Decorator/GetUser.decorator";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";

@Controller('auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
    constructor(private readonly auditoriaService: AuditoriaService) {}

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todas las auditorías' })
    getAll() {
        return this.auditoriaService.getAuditorias();
    }

    @Get('/modulo/:modulo')
    @ApiOperation({ summary: 'Obtener auditorías por módulo' })
    getAuditoriasPorModulo(@Param('modulo') modulo: string) {
        return this.auditoriaService.getAuditoriasPorModulo(modulo);
    }

    @Get('/mis-auditorias')
    @ApiOperation({ summary: 'Obtener auditorías del usuario autenticado' })
    getAuditoriasPorUsuario(@GetUser() usuario: Usuario) {
        return this.auditoriaService.getAuditoriasPorUsuario(usuario.Id_Usuario);
    }

    @Get('/usuario/:usuarioId')
    @ApiOperation({ summary: 'Obtener auditorías por usuario (admin)' })
    getAuditoriasPorUsuarioAdmin(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
        return this.auditoriaService.getAuditoriasPorUsuario(usuarioId);
    }
}