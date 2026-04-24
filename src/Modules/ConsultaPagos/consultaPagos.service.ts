import { FacturaService } from './../Facturas/factura.service';
import { ConsultaJuridicaDTO } from "./ConsultaPagoDTO'S/consultaJuridica.dto";
import { TipoIdentificacion } from 'src/Common/Enums/TipoIdentificacion.enum';
import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { AfiliadoFisico, AfiliadoJuridico } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { ConsultaPago } from './ConsultaPagoEntities/ConsultaPago.entity';
import { ConsultaFisicaDTO } from "./ConsultaPagoDTO'S/consultaFisica.dto";
import { ValidationsService } from 'src/Validations/Validations.service';
import {
    ConsultaPorMedidorResponseDTO,
    ConsultaAfiliadoFisicoResponseDTO,
    ConsultaAfiliadoJuridicoResponseDTO
} from "./ConsultaPagoDTO'S/ConsultaFacturaResponse.dto";
import { LecturaService } from '../Lecturas/lectura.service';
import { GenerarFacturaConsultaDTO } from "./ConsultaPagoDTO'S/generarFacturaConsulta.dto";
import { ConsultaAfiliadoFisico, ConsultaAfiliadoJuridico, FacturaPdfInput } from "./ConsultaPagoDTO'S/ConsultaTypes";

@Injectable()
export class PagosService {
    constructor(
        @InjectRepository(ConsultaPago)
        private readonly consultaPagoRepository: Repository<ConsultaPago>,

        @InjectRepository(AfiliadoFisico)
        private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(AfiliadoJuridico)
        private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>,

        @InjectRepository(Medidor)
        private readonly medidorRepository: Repository<Medidor>,

        private readonly validationsService: ValidationsService,
        private readonly lecturaService: LecturaService,
        private readonly facturaService: FacturaService,
    ) { }

    // =====================================================================
    // CONSULTA POR NÚMERO DE MEDIDOR
    // =====================================================================
    async getConsultaPagosByMedidor(numeroMedidor: number) {
        const medidor = await this.medidorRepository.findOne({
            where: { Numero_Medidor: numeroMedidor },
            relations: ['Estado_Medidor', 'Afiliado']
        });

        if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

        const estadoMedidor = medidor.Estado_Medidor.Id_Estado_Medidor;
        if (estadoMedidor === 1 || estadoMedidor === 3)
            throw new BadRequestException('El medidor está inactivo o suspendido.');

        // Información del afiliado
        let afiliadoInfo: any = null;
        if (medidor.Afiliado) {
            afiliadoInfo = await this.resolverInfoAfiliado(medidor.Afiliado.Id_Afiliado, medidor.Afiliado.Tipo_Entidad);
        }

        const historialLecturas = await this.lecturaService.getHistorialLecturasByMedidor(numeroMedidor);
        const facturasFormateadas = await this.facturaService.getFacturasFormateadasByMedidor(numeroMedidor);

        if (facturasFormateadas.length === 0)
            throw new BadRequestException('No se encontraron facturas para el medidor proporcionado.');

        await this.consultaPagoRepository.save(
            this.consultaPagoRepository.create({ Numero_Medidor: numeroMedidor })
        );

        return {
            Afiliado: afiliadoInfo,
            Historial_Lecturas: historialLecturas,
            Facturas: facturasFormateadas,
            Total_Facturas: facturasFormateadas.length
        };
    }

    // =====================================================================
    // CONSULTA POR AFILIADO FÍSICO
    // =====================================================================
    async getConsultaPagosByAfiliadoFisico(dto: ConsultaFisicaDTO): Promise<ConsultaAfiliadoFisicoResponseDTO | ConsultaPorMedidorResponseDTO> {
        // Caso 1: Solo identificación → todos los medidores del afiliado
        if (dto.Tipo_Identificacion && dto.Identificacion && !dto.Numero_Medidor) {
            this.validarTipoIdentificacionFisica(dto.Tipo_Identificacion);
            this.validarFormatoIdentificacion(dto.Tipo_Identificacion, dto.Identificacion);

            const afiliado = await this.afiliadoFisicoRepository.findOne({
                where: { Identificacion: dto.Identificacion },
                relations: ['Medidores']
            });

            if (!afiliado) throw new BadRequestException('No se encontró un afiliado físico con la identificación proporcionada.');
            if (!afiliado.Medidores?.length) throw new BadRequestException('El afiliado no tiene medidores asociados.');

            const medidoresInfo = await Promise.all(
                afiliado.Medidores.map(async (medidor) => {
                    try {
                        const [historialLecturas, facturasFormateadas] = await Promise.all([
                            this.lecturaService.getHistorialLecturasByMedidor(medidor.Numero_Medidor),
                            this.facturaService.getFacturasFormateadasByMedidor(medidor.Numero_Medidor),
                        ]);

                        await this.consultaPagoRepository.save(
                            this.consultaPagoRepository.create({
                                Tipo_Identificacion: dto.Tipo_Identificacion,
                                Identificacion: dto.Identificacion,
                                Numero_Medidor: medidor.Numero_Medidor
                            })
                        );

                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            Historial_Lecturas: historialLecturas,
                            Total_Facturas: facturasFormateadas.length,
                            Facturas: facturasFormateadas
                        };
                    } catch (error: any) {
                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            Historial_Lecturas: [],
                            Total_Facturas: 0,
                            Facturas: [],
                            Error: `No se pudo obtener información: ${error?.message || 'Error desconocido'}`
                        };
                    }
                })
            );

            return {
                Afiliado: {
                    Nombre: `${afiliado.Nombre} ${afiliado.Apellido1} ${afiliado.Apellido2 || ''}`.trim(),
                    Identificacion: afiliado.Identificacion
                },
                Total_Medidores: afiliado.Medidores.length,
                Medidores: medidoresInfo
            };
        }

        // Casos 2 y 3: por medidor (con o sin identificación)
        let numeroMedidor: number;
        let afiliadoInfo: any = null;

        if (dto.Numero_Medidor && !dto.Tipo_Identificacion && !dto.Identificacion) {
            // Caso 2: Solo número de medidor
            const medidor = await this.medidorRepository.findOne({
                where: { Numero_Medidor: dto.Numero_Medidor },
                relations: ['Afiliado']
            });
            if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

            if (medidor.Afiliado) {
                const afiliadoFisico = await this.afiliadoFisicoRepository.findOne({
                    where: { Id_Afiliado: medidor.Afiliado.Id_Afiliado }
                });
                if (afiliadoFisico) {
                    afiliadoInfo = {
                        Nombre: `${afiliadoFisico.Nombre} ${afiliadoFisico.Apellido1} ${afiliadoFisico.Apellido2 || ''}`.trim(),
                        Identificacion: afiliadoFisico.Identificacion
                    };
                }
            }
            numeroMedidor = dto.Numero_Medidor;

        } else if (dto.Tipo_Identificacion && dto.Identificacion && dto.Numero_Medidor) {
            // Caso 3: Identificación + medidor
            this.validarTipoIdentificacionFisica(dto.Tipo_Identificacion);
            this.validarFormatoIdentificacion(dto.Tipo_Identificacion, dto.Identificacion);

            const afiliado = await this.afiliadoFisicoRepository.findOne({
                where: { Identificacion: dto.Identificacion },
                relations: ['Medidores']
            });
            if (!afiliado) throw new BadRequestException('No se encontró un afiliado físico con la identificación proporcionada.');

            const medidor = afiliado.Medidores?.find(m => m.Numero_Medidor === dto.Numero_Medidor);
            if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado asociado a esta identificación.');

            afiliadoInfo = {
                Nombre: `${afiliado.Nombre} ${afiliado.Apellido1} ${afiliado.Apellido2 || ''}`.trim(),
                Identificacion: afiliado.Identificacion
            };
            numeroMedidor = dto.Numero_Medidor;

        } else {
            throw new BadRequestException('Debe proporcionar: (1) Tipo de identificación + Identificación, (2) Número de medidor, o (3) Los tres datos.');
        }

        return await this.resolverConsultaMedidor(numeroMedidor, afiliadoInfo, {
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
        });
    }

    // =====================================================================
    // CONSULTA POR AFILIADO JURÍDICO
    // =====================================================================
    async getConsultaPagosByAfiliadoJuridico(dto: ConsultaJuridicaDTO): Promise<ConsultaAfiliadoJuridicoResponseDTO | ConsultaPorMedidorResponseDTO> {
        // Caso 1: Solo cédula jurídica → todos los medidores
        if (dto.Cedula_Juridica && !dto.Numero_Medidor) {
            const afiliado = await this.afiliadoJuridicoRepository.findOne({
                where: { Cedula_Juridica: dto.Cedula_Juridica },
                relations: ['Medidores']
            });
            if (!afiliado) throw new BadRequestException('No se encontró un afiliado jurídico con la cédula jurídica proporcionada.');
            if (!afiliado.Medidores?.length) throw new BadRequestException('El afiliado no tiene medidores asociados.');

            const medidoresInfo = await Promise.all(
                afiliado.Medidores.map(async (medidor) => {
                    try {
                        const [historialLecturas, facturasFormateadas] = await Promise.all([
                            this.lecturaService.getHistorialLecturasByMedidor(medidor.Numero_Medidor),
                            this.facturaService.getFacturasFormateadasByMedidor(medidor.Numero_Medidor),
                        ]);

                        await this.consultaPagoRepository.save(
                            this.consultaPagoRepository.create({
                                Cedula_Juridica: dto.Cedula_Juridica,
                                Numero_Medidor: medidor.Numero_Medidor
                            })
                        );

                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            Historial_Lecturas: historialLecturas,
                            Total_Facturas: facturasFormateadas.length,
                            Facturas: facturasFormateadas
                        };
                    } catch (error: any) {
                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            Historial_Lecturas: [],
                            Total_Facturas: 0,
                            Facturas: [],
                            Error: `No se pudo obtener información: ${error?.message || 'Error desconocido'}`
                        };
                    }
                })
            );

            return {
                Afiliado: {
                    Razon_Social: afiliado.Razon_Social,
                    Cedula_Juridica: afiliado.Cedula_Juridica
                },
                Total_Medidores: afiliado.Medidores.length,
                Medidores: medidoresInfo
            };
        }

        // Casos 2 y 3: por medidor
        let numeroMedidor: number;
        let afiliadoInfo: any = null;

        if (!dto.Cedula_Juridica && dto.Numero_Medidor) {
            // Caso 2: Solo medidor
            const medidor = await this.medidorRepository.findOne({
                where: { Numero_Medidor: dto.Numero_Medidor },
                relations: ['Afiliado']
            });
            if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

            if (medidor.Afiliado) {
                const afiliadoJuridico = await this.afiliadoJuridicoRepository.findOne({
                    where: { Id_Afiliado: medidor.Afiliado.Id_Afiliado }
                });
                if (afiliadoJuridico) {
                    afiliadoInfo = {
                        Razon_Social: afiliadoJuridico.Razon_Social,
                        Cedula_Juridica: afiliadoJuridico.Cedula_Juridica
                    };
                }
            }
            numeroMedidor = dto.Numero_Medidor;

        } else if (dto.Cedula_Juridica && dto.Numero_Medidor) {
            // Caso 3: Cédula + medidor
            const afiliado = await this.afiliadoJuridicoRepository.findOne({
                where: { Cedula_Juridica: dto.Cedula_Juridica },
                relations: ['Medidores']
            });
            if (!afiliado) throw new BadRequestException('No se encontró un afiliado jurídico con la cédula jurídica proporcionada.');

            const medidor = afiliado.Medidores?.find(m => m.Numero_Medidor === dto.Numero_Medidor);
            if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado asociado a esta cédula jurídica.');

            afiliadoInfo = {
                Razon_Social: afiliado.Razon_Social,
                Cedula_Juridica: afiliado.Cedula_Juridica
            };
            numeroMedidor = dto.Numero_Medidor;

        } else {
            throw new BadRequestException('Debe proporcionar: (1) Cédula jurídica, (2) Número de medidor, o (3) Ambos datos.');
        }

        return await this.resolverConsultaMedidor(numeroMedidor, afiliadoInfo, {
            Cedula_Juridica: dto.Cedula_Juridica,
        });
    }

    // =====================================================================
    // GENERAR DATOS PARA PDF
    // =====================================================================
    async getDatosFacturaPdf(dto: GenerarFacturaConsultaDTO): Promise<FacturaPdfInput[]> {
        const facturas: FacturaPdfInput[] = [];

        if (dto.Numero_Medidor) {
            const consulta = await this.getConsultaPagosByMedidor(dto.Numero_Medidor) as any;
            const mapped = this.mapConsultaAFactura(consulta, dto.Numero_Medidor,
                consulta?.Afiliado?.Identificacion || consulta?.Afiliado?.Cedula_Juridica || 'No disponible',
                consulta?.Afiliado?.Nombre_Completo || consulta?.Afiliado?.Razon_Social || consulta?.Afiliado?.Nombre || 'Afiliado'
            );
            if (mapped) facturas.push(...mapped);

        } else if (dto.Tipo_Identificacion && dto.Identificacion) {
            const consultaFisica = await this.getConsultaPagosByAfiliadoFisico({
                Tipo_Identificacion: dto.Tipo_Identificacion,
                Identificacion: dto.Identificacion,
            }) as any;

            if (this.isConsultaAgrupadaFisica(consultaFisica)) {
                for (const medidor of consultaFisica.Medidores) {
                    const mapped = this.mapConsultaAFactura(medidor, medidor.Numero_Medidor,
                        consultaFisica.Afiliado.Identificacion, consultaFisica.Afiliado.Nombre);
                    if (mapped) facturas.push(...mapped);
                }
            } else {
                const mapped = this.mapConsultaAFactura(consultaFisica, consultaFisica.Numero_Medidor,
                    dto.Identificacion, consultaFisica?.Afiliado?.Nombre || 'Afiliado Físico');
                if (mapped) facturas.push(...mapped);
            }

        } else if (dto.Cedula_Juridica) {
            const consultaJuridica = await this.getConsultaPagosByAfiliadoJuridico({
                Cedula_Juridica: dto.Cedula_Juridica,
            }) as any;

            if (this.isConsultaAgrupadaJuridica(consultaJuridica)) {
                for (const medidor of consultaJuridica.Medidores) {
                    const mapped = this.mapConsultaAFactura(medidor, medidor.Numero_Medidor,
                        consultaJuridica.Afiliado.Cedula_Juridica, consultaJuridica.Afiliado.Razon_Social);
                    if (mapped) facturas.push(...mapped);
                }
            } else {
                const mapped = this.mapConsultaAFactura(consultaJuridica, consultaJuridica.Numero_Medidor,
                    dto.Cedula_Juridica, consultaJuridica?.Afiliado?.Razon_Social || 'Afiliado Jurídico');
                if (mapped) facturas.push(...mapped);
            }
        } else {
            throw new BadRequestException('Debe enviar Numero_Medidor, Tipo_Identificacion + Identificacion, o Cedula_Juridica.');
        }

        if (facturas.length === 0)
            throw new BadRequestException('No se encontraron medidores con datos de factura para generar el PDF.');

        return facturas;
    }

    // =====================================================================
    // HELPERS PRIVADOS
    // =====================================================================

    /**
     * Lógica compartida para los casos de consulta por medidor único.
     * Evita duplicar el bloque de "obtener historial + facturas + registrar consulta"
     * en getConsultaPagosByAfiliadoFisico y getConsultaPagosByAfiliadoJuridico.
     */
    private async resolverConsultaMedidor(
        numeroMedidor: number,
        afiliadoInfo: any,
        datosConsulta: Partial<{ Tipo_Identificacion: any; Identificacion: string; Cedula_Juridica: string }>
    ) {
        const [historialLecturas, facturasFormateadas] = await Promise.all([
            this.lecturaService.getHistorialLecturasByMedidor(numeroMedidor),
            this.facturaService.getFacturasFormateadasByMedidor(numeroMedidor),
        ]);

        if (facturasFormateadas.length === 0)
            throw new BadRequestException('No se encontraron facturas para el medidor proporcionado.');

        await this.consultaPagoRepository.save(
            this.consultaPagoRepository.create({ ...datosConsulta, Numero_Medidor: numeroMedidor })
        );

        return {
            Numero_Medidor: numeroMedidor,
            Afiliado: afiliadoInfo,
            Historial_Lecturas: historialLecturas,
            Total_Facturas: facturasFormateadas.length,
            Facturas: facturasFormateadas
        };
    }

    /** Resuelve la info del afiliado según su tipo (físico=1, jurídico=2) */
    private async resolverInfoAfiliado(idAfiliado: number, tipoEntidad: number): Promise<any> {
        if (tipoEntidad === 1) {
            const af = await this.afiliadoFisicoRepository.findOne({ where: { Id_Afiliado: idAfiliado } });
            if (!af) return null;
            return {
                Identificacion: af.Identificacion,
                Nombre_Completo: `${af.Nombre} ${af.Apellido1} ${af.Apellido2 || ''}`.trim()
            };
        } else if (tipoEntidad === 2) {
            const aj = await this.afiliadoJuridicoRepository.findOne({ where: { Id_Afiliado: idAfiliado } });
            if (!aj) return null;
            return {
                Cedula_Juridica: aj.Cedula_Juridica,
                Razon_Social: aj.Razon_Social
            };
        }
        return null;
    }

    /** Parsea strings con símbolo de moneda (₡) a número */
    private parseMonto(valor: string | number | undefined | null): number {
        if (valor === null || valor === undefined) return 0;
        if (typeof valor === 'number') return valor;
        const limpio = String(valor).replace(/[₡\sCRC,]/g, '').replace(/[^0-9.-]/g, '');
        const num = parseFloat(limpio);
        return isNaN(num) ? 0 : num;
    }

    /**
     * Mapea la respuesta de consulta al formato que espera el PDF.
     * Las facturas ya vienen formateadas por FacturaService, así que
     * solo leemos los campos correctos del ConsultaPagoResponseDTO.
     */
    private mapConsultaAFactura(
        consulta: any,
        numeroMedidor: number,
        identificacion: string,
        nombreCliente: string
    ): FacturaPdfInput[] {
        const historialLecturas: any[] = Array.isArray(consulta?.Historial_Lecturas)
            ? consulta.Historial_Lecturas : [];

        const facturas: any[] = Array.isArray(consulta?.Facturas) ? consulta.Facturas : [];
        if (facturas.length === 0) return [];

        const afiliadoInfo = consulta?.Afiliado || {};

        const identificacionFinal =
            afiliadoInfo?.Identificacion
            || afiliadoInfo?.Cedula_Juridica
            || identificacion
            || 'No disponible';

        const nombreFinal =
            afiliadoInfo?.Nombre_Completo
            || afiliadoInfo?.Razon_Social
            || (afiliadoInfo?.Nombre
                ? `${afiliadoInfo.Nombre} ${afiliadoInfo.Apellido1 || ''} ${afiliadoInfo.Apellido2 || ''}`.trim()
                : null)
            || nombreCliente
            || 'Afiliado';

        // Las facturas ya vienen en formato ConsultaPagoResponseDTO desde FacturaService
        return facturas.map((factura: any): FacturaPdfInput => ({
            numeroMedidor: Number(numeroMedidor),
            identificacion: identificacionFinal,
            nombreCliente: nombreFinal,
            tipoTarifa: factura?.Tipo_Tarifa_Aplicada || 'No definida',
            fechaEmision: factura?.Fecha_Emision ? new Date(factura.Fecha_Emision) : new Date(),
            fechaVencimiento: factura?.Fecha_Vencimiento
                ? new Date(factura.Fecha_Vencimiento)
                : (() => { const d = new Date(factura?.Fecha_Emision || Date.now()); d.setDate(d.getDate() + 15); return d; })(),
            historialLecturas,
            consumoM3:            Number(factura?.Consumo_M3 || 0),
            // Todos los montos vienen como "₡1234.00" desde formatearFacturaParaConsulta
            costoPorM3:           this.parseMonto(factura?.Cargo_Consumo) / (Number(factura?.Consumo_M3) || 1),
            cargoFijo:            this.parseMonto(factura?.Cargo_Fijo),
            cargoConsumo:         this.parseMonto(factura?.Cargo_Consumo),
            cargoRecursoHidrico:  this.parseMonto(factura?.Cargo_Recurso_Hidrico),
            otrosCargos:          this.parseMonto(factura?.Otros_Cargos),
            subtotal:             this.parseMonto(factura?.Subtotal),
            impuestos:            this.parseMonto(factura?.Impuestos),
            totalPagar:           this.parseMonto(factura?.Total),
            estadoFactura:        factura?.Estado?.Nombre_Estado || 'PENDIENTE',
            numeroFactura:        factura?.Numero_Factura || `${numeroMedidor}-${Date.now()}`,
        }));
    }

    private validarTipoIdentificacionFisica(tipo: TipoIdentificacion) {
        if (tipo !== TipoIdentificacion.CEDULA &&
            tipo !== TipoIdentificacion.DIMEX &&
            tipo !== TipoIdentificacion.PASAPORTE) {
            throw new BadRequestException('Tipo de identificación no válido para afiliado físico. Debe ser CEDULA, DIMEX o PASAPORTE.');
        }
    }

    private validarFormatoIdentificacion(tipo: TipoIdentificacion, identificacion: string) {
        try {
            this.validationsService.validarFormatoIdentificacion(tipo, identificacion);
        } catch (error: any) {
            throw new BadRequestException(error?.message || 'Error de validación');
        }
    }

    private isConsultaAgrupadaFisica(value: any): value is ConsultaAfiliadoFisico {
        return value && 'Medidores' in value && 'Afiliado' in value;
    }

    private isConsultaAgrupadaJuridico(value: any): value is ConsultaAfiliadoJuridico {
        return value && 'Medidores' in value && 'Afiliado' in value;
    }

    // Alias para compatibilidad con el nombre anterior
    private isConsultaAgrupadaJuridica = this.isConsultaAgrupadaJuridico;
}