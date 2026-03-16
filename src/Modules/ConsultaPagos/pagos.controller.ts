import { Controller, Get } from "@nestjs/common";
import { PagosService } from "./pagos.service";
import { Public } from "../auth/Decorator/Public.decorator";
import { ApiOperation } from "@nestjs/swagger";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";

@Controller('pagos')
export class PagosController {
    constructor(
        private readonly pagosService: PagosService
    ) { }

    @Public()
    @Get('/afiliado-fisico')
    @ApiOperation({ summary: 'Obtener pagos de un afiliado físico por tipo y número de identificación' })
    getPagosByAfiliadoFisico(Tipo: TipoIdentificacion, Identificacion: string) {
        return this.pagosService.getPagosByAfiliadoFisico(Tipo, Identificacion);
    }

    @Public()
    @Get('/afiliado-juridico')
    @ApiOperation({ summary: 'Obtener pagos de un afiliado jurídico por cédula jurídica' })
    getPagosByAfiliadoJuridico(Cedula_Juridica: string) {
        return this.pagosService.getPagosByAfiliadoJuridico(Cedula_Juridica);
    }
}