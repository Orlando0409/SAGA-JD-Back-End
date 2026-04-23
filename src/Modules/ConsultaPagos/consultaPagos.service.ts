import { ConsultaJuridicaDTO } from './ConsultaPagoDTO\'S/consultaJuridica.dto';
import { TipoIdentificacion } from 'src/Common/Enums/TipoIdentificacion.enum';
import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { AfiliadoFisico, AfiliadoJuridico } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { ConsultaPago } from './ConsultaPagoEntities/ConsultaPago.entity';
import { ConsultaFisicaDTO } from './ConsultaPagoDTO\'S/consultaFisica.dto';
import { ValidationsService } from 'src/Validations/Validations.service';
import { Factura } from '../Facturas/FacturaEntities/Factura.Entity';
import { 
    ConsultaPorMedidorResponseDTO, 
    ConsultaAfiliadoFisicoResponseDTO, 
    ConsultaAfiliadoJuridicoResponseDTO 
} from './ConsultaPagoDTO\'S/ConsultaFacturaResponse.dto';

@Injectable()
export class PagosService {
    constructor(
        @InjectRepository(ConsultaPago)
        private readonly consultaPagoRepository: Repository<ConsultaPago>,

        @InjectRepository(Factura)
        private readonly facturaRepository: Repository<Factura>,

        @InjectRepository(AfiliadoFisico)
        private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(AfiliadoJuridico)
        private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>,

        @InjectRepository(Medidor)
        private readonly medidorRepository: Repository<Medidor>,

        private readonly validationsService: ValidationsService
    ) { }

    async getConsultaPagosByMedidor(numeroMedidor: number): Promise<ConsultaPorMedidorResponseDTO> {
        const medidor = await this.medidorRepository.findOne({
            where: { Numero_Medidor: numeroMedidor },
            relations: ['Estado_Medidor', 'Afiliado']
        });
        if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

        const estadoMedidor = medidor.Estado_Medidor.Id_Estado_Medidor;
        if (estadoMedidor === 1 || estadoMedidor === 3) throw new BadRequestException('El medidor esta inactivo o suspendido.');

        // Buscar todas las facturas asociadas a este medidor a través del afiliado
        const facturas = await this.facturaRepository.find({
            where: { 
                Lectura: { 
                    Medidor: { Numero_Medidor: numeroMedidor } 
                } 
            },
            relations: ['Estado', 'Lectura'],
            order: { Fecha_Emision: 'DESC' }
        });

        if (!facturas || facturas.length === 0) {
            throw new BadRequestException('No se encontraron facturas para el medidor proporcionado.');
        }

        // Registrar consulta
        const ConsultaPago = this.consultaPagoRepository.create({
            Numero_Medidor: numeroMedidor
        });
        await this.consultaPagoRepository.save(ConsultaPago);

        // Formatear facturas para respuesta
        const facturasFormateadas = facturas.map(factura => ({
            Numero_Factura: factura.Numero_Factura,
            Fecha_Emision: factura.Fecha_Emision,
            Fecha_Vencimiento: factura.Fecha_Vencimiento,
            Estado: factura.Estado.Nombre_Estado,
            Consumo_M3: Number(factura.Consumo_M3),
            Cargo_Fijo: `₡${Number(factura.Cargo_Fijo).toFixed(2)}`,
            Cargo_Consumo: `₡${Number(factura.Cargo_Consumo).toFixed(2)}`,
            Cargo_Recurso_Hidrico: `₡${Number(factura.Cargo_Recurso_Hidrico || 0).toFixed(2)}`,
            Otros_Cargos: `₡${Number(factura.Otros_Cargos || 0).toFixed(2)}`,
            Total: `₡${Number(factura.Total).toFixed(2)}`,
            Tipo_Tarifa: factura.Tipo_Tarifa_Aplicada || 'No especificada'
        }));

        return {
            Numero_Medidor: numeroMedidor,
            Total_Facturas: facturas.length,
            Facturas: facturasFormateadas
        };
    }

    async getConsultaPagosByAfiliadoFisico(dto: ConsultaFisicaDTO): Promise<ConsultaAfiliadoFisicoResponseDTO | ConsultaPorMedidorResponseDTO> {
        // Caso 1: Solo tipo de identificación + identificación (sin número de medidor)
        // Devuelve información de TODOS los medidores asociados
        if (dto.Tipo_Identificacion && dto.Identificacion && !dto.Numero_Medidor) {
            if (dto.Tipo_Identificacion !== TipoIdentificacion.CEDULA &&
                dto.Tipo_Identificacion !== TipoIdentificacion.DIMEX &&
                dto.Tipo_Identificacion !== TipoIdentificacion.PASAPORTE) {
                throw new BadRequestException('Tipo de identificación no válido para afiliado físico. Debe ser CEDULA, DIMEX o PASAPORTE.');
            }

            // Validar formato de identificación usando el servicio de validaciones
            try {
                this.validationsService.validarFormatoIdentificacion(dto.Tipo_Identificacion, dto.Identificacion);
            } catch (error: any) {
                throw new BadRequestException(error?.message || 'Error de validación');
            }

            const afiliado = await this.afiliadoFisicoRepository.findOne({
                where: { Identificacion: dto.Identificacion },
                relations: ['Medidores']
            });

            if (!afiliado) throw new BadRequestException('No se encontró un afiliado físico con la identificación proporcionada.');
            if (!afiliado.Medidores || afiliado.Medidores.length === 0) {
                throw new BadRequestException('El afiliado no tiene medidores asociados.');
            }

            // Mapear información de todos los medidores
            const medidoresInfo = await Promise.all(
                afiliado.Medidores.map(async (medidor) => {
                    try {
                        // Buscar facturas del medidor
                        const facturas = await this.facturaRepository.find({
                            where: { 
                                Lectura: { 
                                    Medidor: { Numero_Medidor: medidor.Numero_Medidor } 
                                } 
                            },
                            relations: ['Estado', 'Lectura'],
                            order: { Fecha_Emision: 'DESC' }
                        });

                        // Registrar consulta para cada medidor
                        const ConsultaPago = this.consultaPagoRepository.create({
                            Tipo_Identificacion: dto.Tipo_Identificacion,
                            Identificacion: dto.Identificacion,
                            Numero_Medidor: medidor.Numero_Medidor
                        });
                        await this.consultaPagoRepository.save(ConsultaPago);

                        const facturasFormateadas = facturas.map(factura => ({
                            Numero_Factura: factura.Numero_Factura,
                            Fecha_Emision: factura.Fecha_Emision,
                            Fecha_Vencimiento: factura.Fecha_Vencimiento,
                            Estado: factura.Estado.Nombre_Estado,
                            Total: `₡${Number(factura.Total).toFixed(2)}`
                        }));

                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            Total_Facturas: facturas.length,
                            Facturas: facturasFormateadas
                        };
                    } catch (error: any) {
                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
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

        // Caso 2: Solo número de medidor (sin identificación ni tipo)
        let numeroMedidor: number;

        if (dto.Numero_Medidor && !dto.Tipo_Identificacion && !dto.Identificacion) {
            const medidor = await this.medidorRepository.findOne({
                where: { Numero_Medidor: dto.Numero_Medidor }
            });

            if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

            numeroMedidor = dto.Numero_Medidor;
        }

        // Caso 3: Tipo de identificación + identificación + número de medidor
        else if (dto.Tipo_Identificacion && dto.Identificacion && dto.Numero_Medidor) {
            if (dto.Tipo_Identificacion !== TipoIdentificacion.CEDULA &&
                dto.Tipo_Identificacion !== TipoIdentificacion.DIMEX &&
                dto.Tipo_Identificacion !== TipoIdentificacion.PASAPORTE) {
                throw new BadRequestException('Tipo de identificación no válido para afiliado físico. Debe ser CEDULA, DIMEX o PASAPORTE.');
            }

            // Validar formato de identificación usando el servicio de validaciones
            try {
                this.validationsService.validarFormatoIdentificacion(dto.Tipo_Identificacion, dto.Identificacion);
            } catch (error: any) {
                throw new BadRequestException(error?.message || 'Error de validación');
            }

            const afiliado = await this.afiliadoFisicoRepository.findOne({
                where: { Identificacion: dto.Identificacion },
                relations: ['Medidores']
            });
            if (!afiliado) throw new BadRequestException('No se encontró un afiliado físico con la identificación proporcionada.');

            const medidor = afiliado.Medidores?.find(m => m.Numero_Medidor === dto.Numero_Medidor);
            if (!medidor) {
                throw new BadRequestException('No se encontró un medidor con el número proporcionado asociado a esta identificación.');
            }

            numeroMedidor = dto.Numero_Medidor;
        }

        else throw new BadRequestException('Debe proporcionar: (1) Tipo de identificación + Identificación, (2) Número de medidor, o (3) Los tres datos.');

        // Buscar facturas del medidor
        const facturas = await this.facturaRepository.find({
            where: { Lectura: { Medidor: { Numero_Medidor: numeroMedidor } } },
            relations: ['Estado', 'Lectura'],
            order: { Fecha_Emision: 'DESC' }
        });

        if (!facturas || facturas.length === 0) throw new BadRequestException('No se encontraron facturas para el medidor proporcionado.');

        const ConsultaPago = this.consultaPagoRepository.create({
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Numero_Medidor: numeroMedidor
        });
        await this.consultaPagoRepository.save(ConsultaPago);

        const facturasFormateadas = facturas.map(factura => ({
            Numero_Factura: factura.Numero_Factura,
            Fecha_Emision: factura.Fecha_Emision,
            Fecha_Vencimiento: factura.Fecha_Vencimiento,
            Estado: factura.Estado.Nombre_Estado,
            Consumo_M3: Number(factura.Consumo_M3),
            Cargo_Fijo: `₡${Number(factura.Cargo_Fijo).toFixed(2)}`,
            Cargo_Consumo: `₡${Number(factura.Cargo_Consumo).toFixed(2)}`,
            Cargo_Recurso_Hidrico: `₡${Number(factura.Cargo_Recurso_Hidrico || 0).toFixed(2)}`,
            Otros_Cargos: `₡${Number(factura.Otros_Cargos || 0).toFixed(2)}`,
            Total: `₡${Number(factura.Total).toFixed(2)}`,
            Tipo_Tarifa: factura.Tipo_Tarifa_Aplicada || 'No especificada'
        }));

        return {
            Numero_Medidor: numeroMedidor,
            Total_Facturas: facturas.length,
            Facturas: facturasFormateadas
        };
    }

    async getConsultaPagosByAfiliadoJuridico(dto: ConsultaJuridicaDTO): Promise<ConsultaAfiliadoJuridicoResponseDTO | ConsultaPorMedidorResponseDTO> {
        if (dto.Cedula_Juridica && !dto.Numero_Medidor) {
            const afiliado = await this.afiliadoJuridicoRepository.findOne({
                where: { Cedula_Juridica: dto.Cedula_Juridica },
                relations: ['Medidores']
            });
            if (!afiliado) throw new BadRequestException('No se encontró un afiliado jurídico con la cédula jurídica proporcionada.');
            if (!afiliado.Medidores || afiliado.Medidores.length === 0) throw new BadRequestException('El afiliado no tiene medidores asociados.');

            const medidoresInfo = await Promise.all(
                afiliado.Medidores.map(async (medidor) => {
                    try {
                        // Buscar facturas del medidor
                        const facturas = await this.facturaRepository.find({
                            where: { 
                                Lectura: { 
                                    Medidor: { Numero_Medidor: medidor.Numero_Medidor } 
                                } 
                            },
                            relations: ['Estado', 'Lectura'],
                            order: { Fecha_Emision: 'DESC' }
                        });

                        // Registrar consulta para cada medidor
                        const ConsultaPago = this.consultaPagoRepository.create({
                            Cedula_Juridica: dto.Cedula_Juridica,
                            Numero_Medidor: medidor.Numero_Medidor
                        });
                        await this.consultaPagoRepository.save(ConsultaPago);

                        const facturasFormateadas = facturas.map(factura => ({
                            Numero_Factura: factura.Numero_Factura,
                            Fecha_Emision: factura.Fecha_Emision,
                            Fecha_Vencimiento: factura.Fecha_Vencimiento,
                            Estado: factura.Estado.Nombre_Estado,
                            Total: `₡${Number(factura.Total).toFixed(2)}`
                        }));

                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            Total_Facturas: facturas.length,
                            Facturas: facturasFormateadas
                        };
                    } catch (error: any) {
                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
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

        let numeroMedidor: number;

        if (!dto.Cedula_Juridica && dto.Numero_Medidor) {
            const medidor = await this.medidorRepository.findOne({
                where: { Numero_Medidor: dto.Numero_Medidor }
            });
            if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

            numeroMedidor = dto.Numero_Medidor;
        }

        else if (dto.Cedula_Juridica && dto.Numero_Medidor) {
            const afiliado = await this.afiliadoJuridicoRepository.findOne({
                where: { Cedula_Juridica: dto.Cedula_Juridica },
                relations: ['Medidores']
            });
            if (!afiliado) throw new BadRequestException('No se encontró un afiliado jurídico con la cédula jurídica proporcionada.');

            const medidor = afiliado.Medidores?.find(m => m.Numero_Medidor === dto.Numero_Medidor);
            if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado asociado a esta cédula jurídica.');

            numeroMedidor = dto.Numero_Medidor;
        }

        else throw new BadRequestException('Debe proporcionar: (1) Cédula jurídica, (2) Número de medidor, o (3) Ambos datos.');

        // Buscar facturas del medidor
        const facturas = await this.facturaRepository.find({
            where: { 
                Lectura: { 
                    Medidor: { Numero_Medidor: numeroMedidor } 
                } 
            },
            relations: ['Estado', 'Lectura'],
            order: { Fecha_Emision: 'DESC' }
        });

        if (!facturas || facturas.length === 0) {
            throw new BadRequestException('No se encontraron facturas para el medidor proporcionado.');
        }

        const facturasFormateadas = facturas.map(factura => ({
            Numero_Factura: factura.Numero_Factura,
            Fecha_Emision: factura.Fecha_Emision,
            Fecha_Vencimiento: factura.Fecha_Vencimiento,
            Estado: factura.Estado.Nombre_Estado,
            Consumo_M3: Number(factura.Consumo_M3),
            Cargo_Fijo: `₡${Number(factura.Cargo_Fijo).toFixed(2)}`,
            Cargo_Consumo: `₡${Number(factura.Cargo_Consumo).toFixed(2)}`,
            Cargo_Recurso_Hidrico: `₡${Number(factura.Cargo_Recurso_Hidrico || 0).toFixed(2)}`,
            Otros_Cargos: `₡${Number(factura.Otros_Cargos || 0).toFixed(2)}`,
            Total: `₡${Number(factura.Total).toFixed(2)}`,
            Tipo_Tarifa: factura.Tipo_Tarifa_Aplicada || 'No especificada'
        }));

        return {
            Numero_Medidor: numeroMedidor,
            Total_Facturas: facturas.length,
            Facturas: facturasFormateadas
        };
    }
}