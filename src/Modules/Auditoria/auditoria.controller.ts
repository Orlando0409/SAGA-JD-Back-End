import { Controller, Get, Param, ParseIntPipe, BadRequestException } from "@nestjs/common";
import { AuditoriaService } from "./auditoria.service";
import { ApiOperation } from "@nestjs/swagger";

@Controller('auditoria')
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

    @Get('/usuario/:usuarioId')
    @ApiOperation({ summary: 'Obtener auditorías por usuario' })
    getAuditoriasPorUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
        return this.auditoriaService.getAuditoriasPorUsuario(usuarioId);
    }
}