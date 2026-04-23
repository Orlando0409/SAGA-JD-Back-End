import { Body, Controller, Param, Get, Post, Res, BadRequestException } from "@nestjs/common";
import { PagosService } from "./consultaPagos.service";
import { Public } from "../auth/Decorator/Public.decorator";
import { ApiOperation } from "@nestjs/swagger";
import { ConsultaFisicaDTO } from "./ConsultaPagoDTO'S/consultaFisica.dto";
import { ConsultaJuridicaDTO } from "./ConsultaPagoDTO'S/consultaJuridica.dto";
import { Response } from "express";
import { GenerarFacturaConsultaDTO } from "./ConsultaPagoDTO'S/generarFacturaConsulta.dto";
import { ConsultaPagosPdfService } from "./consultaPagosPdf.service";
import { FacturaPdfInput } from "./ConsultaPagoDTO'S/ConsultaTypes";
import { 
    ConsultaPorMedidorResponseDTO, 
    ConsultaAfiliadoFisicoResponseDTO, 
    ConsultaAfiliadoJuridicoResponseDTO,
    MedidorConFacturasDTO,
    FacturaDetalleDTO
} from "./ConsultaPagoDTO'S/ConsultaFacturaResponse.dto";

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
        const facturasPdf: FacturaPdfInput[] = [];

        if (dto.Numero_Medidor) {
            const consulta = await this.pagosService.getConsultaPagosByMedidor(dto.Numero_Medidor) as ConsultaPorMedidorResponseDTO;
            
            if (consulta.Facturas.length > 0) {
                const ultimaFactura = consulta.Facturas[0]; // La más reciente
                facturasPdf.push(this.mapFacturaAPdf(
                    ultimaFactura,
                    consulta.Numero_Medidor,
                    dto.Identificacion || 'No disponible',
                    'Afiliado'
                ));
            }
        } else if (dto.Tipo_Identificacion && dto.Identificacion) {
            const consultaFisica = await this.pagosService.getConsultaPagosByAfiliadoFisico({
                Tipo_Identificacion: dto.Tipo_Identificacion,
                Identificacion: dto.Identificacion,
            });

            if (this.isConsultaAfiliadoFisico(consultaFisica)) {
                consultaFisica.Medidores.forEach((medidor) => {
                    if (this.tieneMedidorFacturas(medidor) && medidor.Facturas.length > 0) {
                        const ultimaFactura = medidor.Facturas[0];
                        facturasPdf.push(this.mapFacturaSimpleAPdf(
                            ultimaFactura,
                            medidor.Numero_Medidor,
                            consultaFisica.Afiliado.Identificacion,
                            consultaFisica.Afiliado.Nombre
                        ));
                    }
                });
            } else {
                // Caso individual con número de medidor
                const consultaIndividual = consultaFisica as ConsultaPorMedidorResponseDTO;
                if (consultaIndividual.Facturas.length > 0) {
                    const ultimaFactura = consultaIndividual.Facturas[0];
                    facturasPdf.push(this.mapFacturaAPdf(
                        ultimaFactura,
                        consultaIndividual.Numero_Medidor,
                        dto.Identificacion,
                        'Afiliado Fisico'
                    ));
                }
            }
        } else if (dto.Cedula_Juridica) {
            const consultaJuridica = await this.pagosService.getConsultaPagosByAfiliadoJuridico({
                Cedula_Juridica: dto.Cedula_Juridica,
            });

            if (this.isConsultaAfiliadoJuridico(consultaJuridica)) {
                consultaJuridica.Medidores.forEach((medidor) => {
                    if (this.tieneMedidorFacturas(medidor) && medidor.Facturas.length > 0) {
                        const ultimaFactura = medidor.Facturas[0];
                        facturasPdf.push(this.mapFacturaSimpleAPdf(
                            ultimaFactura,
                            medidor.Numero_Medidor,
                            consultaJuridica.Afiliado.Cedula_Juridica,
                            consultaJuridica.Afiliado.Razon_Social
                        ));
                    }
                });
            } else {
                // Caso individual con número de medidor
                const consultaIndividual = consultaJuridica as ConsultaPorMedidorResponseDTO;
                if (consultaIndividual.Facturas.length > 0) {
                    const ultimaFactura = consultaIndividual.Facturas[0];
                    facturasPdf.push(this.mapFacturaAPdf(
                        ultimaFactura,
                        consultaIndividual.Numero_Medidor,
                        dto.Cedula_Juridica,
                        'Afiliado Juridico'
                    ));
                }
            }
        } else {
            throw new BadRequestException('Debe enviar Numero_Medidor, Tipo_Identificacion + Identificacion, o Cedula_Juridica.');
        }

        if (facturasPdf.length === 0) {
            throw new BadRequestException('No se encontraron facturas para generar el PDF.');
        }

        await this.consultaPagosPdfService.generarFacturasDesdeConsultas(facturasPdf, res);
    }

    /**
     * Mapea una factura detallada (con todos los campos) a formato PDF
     */
    private mapFacturaAPdf(
        factura: FacturaDetalleDTO,
        numeroMedidor: number,
        identificacion: string,
        nombreCliente: string
    ): FacturaPdfInput {
        // Extraer valores numéricos de los strings formateados (₡1,500.00 -> 1500.00)
        const parseMontoColones = (monto: string): number => {
            return Number(monto.replace('₡', '').replace(/,/g, '')) || 0;
        };

        const totalPagar = parseMontoColones(factura.Total);
        const cargoFijo = parseMontoColones(factura.Cargo_Fijo);
        const cargoConsumo = parseMontoColones(factura.Cargo_Consumo);
        
        // Calcular costo por M³ aproximado (si hay consumo)
        const costoPorM3 = factura.Consumo_M3 > 0 
            ? cargoConsumo / factura.Consumo_M3 
            : 0;

        return {
            numeroMedidor,
            identificacion,
            nombreCliente,
            consumoM3: factura.Consumo_M3,
            costoPorM3,
            cargoFijo,
            totalPagar,
            tipoTarifa: factura.Tipo_Tarifa,
            fechaEmision: factura.Fecha_Emision,
            historialLecturas: [], // Las facturas ya no tienen historial de lecturas
        };
    }

    /**
     * Mapea una factura simple (sin desglose de cargos) a formato PDF
     */
    private mapFacturaSimpleAPdf(
        factura: { Numero_Factura: string; Fecha_Emision: Date; Total: string },
        numeroMedidor: number,
        identificacion: string,
        nombreCliente: string
    ): FacturaPdfInput {
        const parseMontoColones = (monto: string): number => {
            return Number(monto.replace('₡', '').replace(/,/g, '')) || 0;
        };

        return {
            numeroMedidor,
            identificacion,
            nombreCliente,
            consumoM3: 0, // No disponible en facturas simples
            costoPorM3: 0,
            cargoFijo: 0,
            totalPagar: parseMontoColones(factura.Total),
            tipoTarifa: 'No especificada',
            fechaEmision: factura.Fecha_Emision,
            historialLecturas: [],
        };
    }

    private isConsultaAfiliadoFisico(value: any): value is ConsultaAfiliadoFisicoResponseDTO {
        return 'Medidores' in value && 'Afiliado' in value && 'Identificacion' in value.Afiliado;
    }

    private isConsultaAfiliadoJuridico(value: any): value is ConsultaAfiliadoJuridicoResponseDTO {
        return 'Medidores' in value && 'Afiliado' in value && 'Cedula_Juridica' in value.Afiliado;
    }

    private tieneMedidorFacturas(medidor: any): medidor is MedidorConFacturasDTO {
        return 'Facturas' in medidor && Array.isArray(medidor.Facturas);
    }
}