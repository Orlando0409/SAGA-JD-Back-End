import { TipoIdentificacion } from './../../Common/Enums/TipoIdentificacion.enum';
import { Body, Controller, Param, Get, Post } from "@nestjs/common";
import { PagosService } from "./consultaPagos.service";
import { Public } from "../auth/Decorator/Public.decorator";
import { ApiOperation } from "@nestjs/swagger";
import { ConsultaFisicaDTO } from "./ConsultaPagoDTO'S/consultaFisica.dto";
import { ConsultaJuridicaDTO } from "./ConsultaPagoDTO'S/consultaJuridica.dto";

@Controller('consulta-pagos')
export class PagosController {
    constructor(
        private readonly pagosService: PagosService
    ) { }

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
}