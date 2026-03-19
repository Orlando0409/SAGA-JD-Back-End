import { Body, Controller, Get } from "@nestjs/common";
import { PagosService } from "./consultaPagos.service";
import { Public } from "../auth/Decorator/Public.decorator";
import { ApiOperation } from "@nestjs/swagger";
import { ConsultaFisicaDTO } from "./ConsultaPagoDTO'S/consultaFisica.dto";

@Controller('consulta_pagos')
export class PagosController {
    constructor(
        private readonly pagosService: PagosService
    ) { }

    @Public()
    @Get('/afiliado-fisico')
    @ApiOperation({ summary: 'Obtener pagos de un afiliado físico por tipo y número de identificación' })
    getConsultaPagosByAfiliadoFisico (
        @Body() dto: ConsultaFisicaDTO
    ) {
        return this.pagosService.getConsultaPagosByAfiliadoFisico(dto);
    }

    @Public()
    @Get('/afiliado-juridico')
    @ApiOperation({ summary: 'Obtener pagos de un afiliado jurídico por cédula jurídica' })
    getConsultaPagosByAfiliadoJuridico (
        @Body('Cedula_Juridica') Cedula_Juridica: string
    ) {
        return this.pagosService.getConsultaPagosByAfiliadoJuridico(Cedula_Juridica);
    }
}