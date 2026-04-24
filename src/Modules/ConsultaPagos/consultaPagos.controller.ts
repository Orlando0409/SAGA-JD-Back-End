import { Body, Controller, Param, Get, Post, Res, BadRequestException } from "@nestjs/common";
import { Response } from "express";
import { PagosService } from "./consultaPagos.service";
import { Public } from "../auth/Decorator/Public.decorator";
import { ApiOperation } from "@nestjs/swagger";
import { ConsultaFisicaDTO } from "./ConsultaPagoDTO'S/consultaFisica.dto";
import { ConsultaJuridicaDTO } from "./ConsultaPagoDTO'S/consultaJuridica.dto";
import { GenerarFacturaConsultaDTO } from "./ConsultaPagoDTO'S/generarFacturaConsulta.dto";
import { ConsultaAfiliadoFisico, ConsultaAfiliadoJuridico, ConsultaMedidor, FacturaPdfInput } from "./ConsultaPagoDTO'S/ConsultaTypes";
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
        const facturas: FacturaPdfInput[] = [];

        if (dto.Numero_Medidor) {
            const consulta = await this.pagosService.getConsultaPagosByMedidor(dto.Numero_Medidor) as unknown as ConsultaMedidor;
            facturas.push(this.mapConsultaAFactura(
                consulta,
                dto.Numero_Medidor,
                dto.Identificacion || 'No disponible',
                'Afiliado'
            ));
        } else if (dto.Tipo_Identificacion && dto.Identificacion) {
            const consultaFisica = await this.pagosService.getConsultaPagosByAfiliadoFisico({
                Tipo_Identificacion: dto.Tipo_Identificacion,
                Identificacion: dto.Identificacion,
            }) as ConsultaAfiliadoFisico | ConsultaMedidor;

            if (this.isConsultaAgrupadaFisica(consultaFisica)) {
                consultaFisica.Medidores.forEach((medidor) => {
                    facturas.push(this.mapConsultaAFactura(
                        medidor,
                        medidor.Numero_Medidor,
                        consultaFisica.Afiliado.Identificacion,
                        consultaFisica.Afiliado.Nombre,
                    ));
                });
            } else {
                facturas.push(this.mapConsultaAFactura(
                    consultaFisica,
                    consultaFisica.Numero_Medidor,
                    dto.Identificacion,
                    'Afiliado Fisico',
                ));
            }
        } else if (dto.Cedula_Juridica) {
            const consultaJuridica = await this.pagosService.getConsultaPagosByAfiliadoJuridico({
                Cedula_Juridica: dto.Cedula_Juridica,
            }) as ConsultaAfiliadoJuridico | ConsultaMedidor;

            if (this.isConsultaAgrupadaJuridica(consultaJuridica)) {
                consultaJuridica.Medidores.forEach((medidor) => {
                    facturas.push(this.mapConsultaAFactura(
                        medidor,
                        medidor.Numero_Medidor,
                        consultaJuridica.Afiliado.Cedula_Juridica,
                        consultaJuridica.Afiliado.Razon_Social,
                    ));
                });
            } else {
                facturas.push(this.mapConsultaAFactura(
                    consultaJuridica,
                    consultaJuridica.Numero_Medidor,
                    dto.Cedula_Juridica,
                    'Afiliado Juridico',
                ));
            }
        } else throw new BadRequestException('Debe enviar Numero_Medidor, Tipo_Identificacion + Identificacion, o Cedula_Juridica.');

        if (facturas.length === 0) throw new BadRequestException('No se encontraron medidores con datos de factura para generar el PDF.');

        await this.consultaPagosPdfService.generarFacturasDesdeConsultas(facturas, res);
    }

    private mapConsultaAFactura(
        consulta: ConsultaMedidor,
        numeroMedidor: number,
        identificacion: string,
        nombreCliente: string
    ): FacturaPdfInput {
        const calculoFinal = consulta?.['Calculo final'];
        const totalPagar = typeof calculoFinal === 'number'
            ? calculoFinal
            : Number(calculoFinal?.Total_A_Pagar || 0);
        const detalles = typeof calculoFinal === 'object' && calculoFinal !== null
            ? calculoFinal.Detalles
            : undefined;

        const historial = Array.isArray(consulta?.['Historial de lecturas'])
            ? consulta['Historial de lecturas']
            : [];

        const ultimaLectura = historial[0] || {};
        const afiliado = ultimaLectura?.Afiliado || {};

        const identificacionFinal = afiliado?.Identificacion
            || afiliado?.Cedula_Juridica
            || identificacion
            || 'No disponible';

        const nombreFinal = afiliado?.Nombre
            ? `${afiliado?.Nombre || ''} ${afiliado?.Primer_Apellido || ''} ${afiliado?.Segundo_Apellido || ''}`.trim()
            : (afiliado?.Razon_Social || nombreCliente || 'Afiliado');

        const consumoM3 = Number(
            ultimaLectura?.Consumo_Calculado_M3
            || detalles?.Consumo_M3
            || 0
        );

        const tipoTarifa = ultimaLectura?.Tipo_Tarifa?.Nombre_Tipo_Tarifa
            || ultimaLectura?.Tipo_Tarifa?.Nombre_Tipo_Tarifa_Lectura
            || ultimaLectura?.['Tipo de Tarifa']?.Nombre_Tipo_Tarifa
            || ultimaLectura?.['Tipo de Tarifa']?.Nombre
            || 'No definida';

        const costoPorM3 = Number(detalles?.Costo_Por_M3 || 0);
        const cargoFijo = Number(detalles?.Cargo_Fijo || 0);

        return {
            numeroMedidor: Number(numeroMedidor),
            identificacion: identificacionFinal,
            nombreCliente: nombreFinal,
            consumoM3,
            costoPorM3,
            cargoFijo,
            totalPagar,
            tipoTarifa,
            fechaEmision: new Date(),
            historialLecturas: historial,
        };
    }

    private isConsultaAgrupadaFisica(value: ConsultaAfiliadoFisico | ConsultaMedidor): value is ConsultaAfiliadoFisico {
        return 'Medidores' in value && 'Afiliado' in value;
    }

    private isConsultaAgrupadaJuridica(value: ConsultaAfiliadoJuridico | ConsultaMedidor): value is ConsultaAfiliadoJuridico {
        return 'Medidores' in value && 'Afiliado' in value;
    }
}