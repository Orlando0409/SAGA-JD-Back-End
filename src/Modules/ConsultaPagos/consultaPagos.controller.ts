import { Body, Controller, Param, Get, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { PagosService } from "./consultaPagos.service";
import { Public } from "../auth/Decorator/Public.decorator";
import { ApiOperation } from "@nestjs/swagger";
import { ConsultaFisicaDTO } from "./ConsultaPagoDTO'S/consultaFisica.dto";
import { ConsultaJuridicaDTO } from "./ConsultaPagoDTO'S/consultaJuridica.dto";
import { GenerarFacturaConsultaDTO } from "./ConsultaPagoDTO'S/generarFacturaConsulta.dto";
import { ConsultaPagosPdfService } from "./consultaPagosPdf.service";

@Controller('consulta-pagos')
export class PagosController {
    constructor(
        private readonly pagosService: PagosService,
        private readonly consultaPagosPdfService: ConsultaPagosPdfService
    ) { }

    @Public()
    @Get('/medidor/:numeroMedidor')
    @ApiOperation({ summary: 'Obtener pagos asociados a un número de medidor' })
    getConsultaPagosByMedidor (
        @Param('numeroMedidor') numeroMedidor: number
    ) {
        return this.pagosService.getConsultaPagosByMedidor(numeroMedidor);
    }

    @Public()
    @Post('/afiliado-fisico')
    @ApiOperation({ summary: 'Obtener pagos de un afiliado físico por tipo y número de identificación' })
    getConsultaPagosByAfiliadoFisico (
        @Body() dto: ConsultaFisicaDTO
    ) {
        return this.pagosService.getConsultaPagosByAfiliadoFisico(dto);
    }

    @Public()
    @Post('/afiliado-juridico')
    @ApiOperation({ summary: 'Obtener pagos de un afiliado jurídico por cédula jurídica' })
    getConsultaPagosByAfiliadoJuridico (
        @Body() dto: ConsultaJuridicaDTO
    ) {
        return this.pagosService.getConsultaPagosByAfiliadoJuridico(dto);
    }

    @Public()
    @Post('/factura/pdf')
    @ApiOperation({ 
        summary: 'Generar factura PDF desde consulta de pagos por medidor o identificacion'
    })
    async generarFacturaPdfDesdeConsulta(
        @Body() dto: GenerarFacturaConsultaDTO,
        @Res() res: Response
    ) {
        const facturas = await this.pagosService.getDatosFacturaPdf(dto);
        await this.consultaPagosPdfService.generarFacturasDesdeConsultas(facturas, res);
    }
}