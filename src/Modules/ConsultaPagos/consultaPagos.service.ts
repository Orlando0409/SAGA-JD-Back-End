import { FacturaService } from './../Facturas/factura.service';
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
    ConsultaAfiliadoJuridicoResponseDTO,
    ConsultaPagoResponseDTO
} from './ConsultaPagoDTO\'S/ConsultaFacturaResponse.dto';
import { Lectura } from '../Lecturas/LecturaEntities/Lectura.Entity';
import { LecturaService } from '../Lecturas/lectura.service';

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

        private readonly validationsService: ValidationsService,

        private readonly lecturaService: LecturaService,

        private readonly facturaService: FacturaService
    ) { }

    async getConsultaPagosByMedidor(numeroMedidor: number) {
        // 1. Obtener el medidor con sus relaciones
        const medidor = await this.medidorRepository.findOne({
            where: { Numero_Medidor: numeroMedidor },
            relations: ['Estado_Medidor', 'Afiliado']
        });

        if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

        const estadoMedidor = medidor.Estado_Medidor.Id_Estado_Medidor;
        if (estadoMedidor === 1 || estadoMedidor === 3) throw new BadRequestException('El medidor está inactivo o suspendido.');

        // 2. Obtener información del afiliado (físico o jurídico)
        let afiliadoInfo: any = null;
        if (medidor.Afiliado) {
            const tipoAfiliado = medidor.Afiliado.Tipo_Entidad;

            if (tipoAfiliado === 1) { // Afiliado Físico
                const afiliadoFisico = await this.afiliadoFisicoRepository.findOne({
                    where: { Id_Afiliado: medidor.Afiliado.Id_Afiliado }
                });
                if (afiliadoFisico) {
                    afiliadoInfo = {
                        Identificacion: afiliadoFisico.Identificacion,
                        Nombre_Completo: `${afiliadoFisico.Nombre} ${afiliadoFisico.Apellido1} ${afiliadoFisico.Apellido2 || ''}`.trim()
                    };
                }
            } else if (tipoAfiliado === 2) { // Afiliado Jurídico
                const afiliadoJuridico = await this.afiliadoJuridicoRepository.findOne({
                    where: { Id_Afiliado: medidor.Afiliado.Id_Afiliado }
                });
                if (afiliadoJuridico) {
                    afiliadoInfo = {
                        Cedula_Juridica: afiliadoJuridico.Cedula_Juridica,
                        Razon_Social: afiliadoJuridico.Razon_Social
                    };
                }
            }
        }

        // 3. Obtener la última lectura para conocer el tipo de tarifa actual
        const ultimaLectura = await this.lecturaService.getHistorialLecturasByMedidor(numeroMedidor);

        // 4. Historial de lecturas (últimas 5)
        const historialLecturas = ultimaLectura;

        // 5. Obtener facturas con cálculos
        const facturas = await this.facturaRepository
            .createQueryBuilder('factura')
            .leftJoinAndSelect('factura.Lectura', 'lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('factura.Estado', 'estado')
            .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor })
            .orderBy('factura.Fecha_Emision', 'DESC')
            .getMany();

        if (!facturas || facturas.length === 0) throw new BadRequestException('No se encontraron facturas para el medidor proporcionado.');

        // Mapear la información de las facturas con los cálculos
        const facturasCalculos = facturas.map(factura => ({
            Numero_Factura: factura.Numero_Factura,
            Fecha_Emision: factura.Fecha_Emision,
            Fecha_Vencimiento: factura.Fecha_Vencimiento,
            Calculos: {
                Cargo_Fijo: `₡${Number(factura.Cargo_Fijo).toFixed(2)}`,
                Cargo_Consumo: `₡${Number(factura.Cargo_Consumo).toFixed(2)}`,
                Cargo_Recurso_Hidrico: `₡${Number(factura.Cargo_Recurso_Hidrico || 0).toFixed(2)}`,
                Otros_Cargos: `₡${Number(factura.Otros_Cargos || 0).toFixed(2)}`,
                Subtotal: `₡${Number(factura.Subtotal).toFixed(2)}`,
                Impuestos: `₡${Number(factura.Impuestos).toFixed(2)}`,
                Total: `₡${Number(factura.Total).toFixed(2)}`
            },
            Estado_Factura: {
                Id_Estado: factura.Estado.Id_Estado_Factura,
                Nombre_Estado: factura.Estado.Nombre_Estado
            },
        }));

        // Registrar la consulta
        const consultaPago = this.consultaPagoRepository.create({
            Numero_Medidor: numeroMedidor
        });
        await this.consultaPagoRepository.save(consultaPago);

        // Retornar toda la información
        return {
            Afiliado: afiliadoInfo,
            Historial_Lecturas: historialLecturas,
            Facturas: facturasCalculos,
            Total_Facturas: facturas.length
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
                        // Obtener historial de lecturas
                        const historialLecturas = await this.lecturaService.getHistorialLecturasByMedidor(medidor.Numero_Medidor);

                        // Buscar facturas del medidor
                        const facturas = await this.facturaRepository
                            .createQueryBuilder('factura')
                            .leftJoinAndSelect('factura.Lectura', 'lectura')
                            .leftJoinAndSelect('lectura.Medidor', 'medidor')
                            .leftJoinAndSelect('factura.Estado', 'estado')
                            .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor: medidor.Numero_Medidor })
                            .orderBy('factura.Fecha_Emision', 'DESC')
                            .getMany();

                        // Registrar consulta para cada medidor
                        const ConsultaPago = this.consultaPagoRepository.create({
                            Tipo_Identificacion: dto.Tipo_Identificacion,
                            Identificacion: dto.Identificacion,
                            Numero_Medidor: medidor.Numero_Medidor
                        });
                        await this.consultaPagoRepository.save(ConsultaPago);

                        // Mapear facturas con cálculos detallados
                        const facturasCalculos = facturas.map(factura => ({
                            Numero_Factura: factura.Numero_Factura,
                            Fecha_Emision: factura.Fecha_Emision,
                            Fecha_Vencimiento: factura.Fecha_Vencimiento,
                            Calculos: {
                                Cargo_Fijo: `₡${Number(factura.Cargo_Fijo).toFixed(2)}`,
                                Cargo_Consumo: `₡${Number(factura.Cargo_Consumo).toFixed(2)}`,
                                Cargo_Recurso_Hidrico: `₡${Number(factura.Cargo_Recurso_Hidrico || 0).toFixed(2)}`,
                                Otros_Cargos: `₡${Number(factura.Otros_Cargos || 0).toFixed(2)}`,
                                Subtotal: `₡${Number(factura.Subtotal).toFixed(2)}`,
                                Impuestos: `₡${Number(factura.Impuestos).toFixed(2)}`,
                                Total: `₡${Number(factura.Total).toFixed(2)}`
                            },
                            Estado_Factura: {
                                Id_Estado: factura.Estado.Id_Estado_Factura,
                                Nombre_Estado: factura.Estado.Nombre_Estado
                            },
                        }));

                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            Historial_Lecturas: historialLecturas,
                            Total_Facturas: facturas.length,
                            Facturas: facturasCalculos
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

        // Caso 2: Solo número de medidor (sin identificación ni tipo)
        let numeroMedidor: number;
        let afiliadoInfo: any = null;

        if (dto.Numero_Medidor && !dto.Tipo_Identificacion && !dto.Identificacion) {
            const medidor = await this.medidorRepository.findOne({
                where: { Numero_Medidor: dto.Numero_Medidor },
                relations: ['Afiliado']
            });

            if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

            // Obtener información del afiliado
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

            afiliadoInfo = {
                Nombre: `${afiliado.Nombre} ${afiliado.Apellido1} ${afiliado.Apellido2 || ''}`.trim(),
                Identificacion: afiliado.Identificacion
            };

            numeroMedidor = dto.Numero_Medidor;
        }

        else throw new BadRequestException('Debe proporcionar: (1) Tipo de identificación + Identificación, (2) Número de medidor, o (3) Los tres datos.');

        // Obtener historial de lecturas
        const historialLecturas = await this.lecturaService.getHistorialLecturasByMedidor(numeroMedidor);

        // Buscar facturas del medidor
        const facturas = await this.facturaRepository
            .createQueryBuilder('factura')
            .leftJoinAndSelect('factura.Lectura', 'lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('factura.Estado', 'estado')
            .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor })
            .orderBy('factura.Fecha_Emision', 'DESC')
            .getMany();

        if (!facturas || facturas.length === 0) throw new BadRequestException('No se encontraron facturas para el medidor proporcionado.');

        // Mapear la información de las facturas con los cálculos
        const facturasCalculos = facturas.map(factura => ({
            Numero_Factura: factura.Numero_Factura,
            Fecha_Emision: factura.Fecha_Emision,
            Fecha_Vencimiento: factura.Fecha_Vencimiento,
            Calculos: {
                Cargo_Fijo: `₡${Number(factura.Cargo_Fijo).toFixed(2)}`,
                Cargo_Consumo: `₡${Number(factura.Cargo_Consumo).toFixed(2)}`,
                Cargo_Recurso_Hidrico: `₡${Number(factura.Cargo_Recurso_Hidrico || 0).toFixed(2)}`,
                Otros_Cargos: `₡${Number(factura.Otros_Cargos || 0).toFixed(2)}`,
                Subtotal: `₡${Number(factura.Subtotal).toFixed(2)}`,
                Impuestos: `₡${Number(factura.Impuestos).toFixed(2)}`,
                Total: `₡${Number(factura.Total).toFixed(2)}`
            },
            Estado_Factura: {
                Id_Estado: factura.Estado.Id_Estado_Factura,
                Nombre_Estado: factura.Estado.Nombre_Estado
            },
        }));

        // Registrar consulta
        const ConsultaPago = this.consultaPagoRepository.create({
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Numero_Medidor: numeroMedidor
        });
        await this.consultaPagoRepository.save(ConsultaPago);

        return {
            Numero_Medidor: numeroMedidor,
            Afiliado: afiliadoInfo,
            Historial_Lecturas: historialLecturas,
            Total_Facturas: facturas.length,
            Facturas: facturasCalculos
        };
    }

    async getConsultaPagosByAfiliadoJuridico(dto: ConsultaJuridicaDTO): Promise<ConsultaAfiliadoJuridicoResponseDTO | ConsultaPorMedidorResponseDTO> {
        // Caso 1: Solo cédula jurídica (sin número de medidor)
        // Devuelve información de TODOS los medidores asociados
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
                        // Obtener historial de lecturas
                        const historialLecturas = await this.lecturaService.getHistorialLecturasByMedidor(medidor.Numero_Medidor);

                        // Buscar facturas del medidor
                        const facturas = await this.facturaRepository
                            .createQueryBuilder('factura')
                            .leftJoinAndSelect('factura.Lectura', 'lectura')
                            .leftJoinAndSelect('lectura.Medidor', 'medidor')
                            .leftJoinAndSelect('factura.Estado', 'estado')
                            .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor: medidor.Numero_Medidor })
                            .orderBy('factura.Fecha_Emision', 'DESC')
                            .getMany();

                        // Registrar consulta para cada medidor
                        const ConsultaPago = this.consultaPagoRepository.create({
                            Cedula_Juridica: dto.Cedula_Juridica,
                            Numero_Medidor: medidor.Numero_Medidor
                        });
                        await this.consultaPagoRepository.save(ConsultaPago);

                        // Mapear facturas con cálculos detallados
                        const facturasCalculos = facturas.map(factura => ({
                            Numero_Factura: factura.Numero_Factura,
                            Fecha_Emision: factura.Fecha_Emision,
                            Fecha_Vencimiento: factura.Fecha_Vencimiento,
                            Calculos: {
                                Cargo_Fijo: `₡${Number(factura.Cargo_Fijo).toFixed(2)}`,
                                Cargo_Consumo: `₡${Number(factura.Cargo_Consumo).toFixed(2)}`,
                                Cargo_Recurso_Hidrico: `₡${Number(factura.Cargo_Recurso_Hidrico || 0).toFixed(2)}`,
                                Otros_Cargos: `₡${Number(factura.Otros_Cargos || 0).toFixed(2)}`,
                                Subtotal: `₡${Number(factura.Subtotal).toFixed(2)}`,
                                Impuestos: `₡${Number(factura.Impuestos).toFixed(2)}`,
                                Total: `₡${Number(factura.Total).toFixed(2)}`
                            },
                            Estado_Factura: {
                                Id_Estado: factura.Estado.Id_Estado_Factura,
                                Nombre_Estado: factura.Estado.Nombre_Estado
                            },
                        }));

                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            Historial_Lecturas: historialLecturas,
                            Total_Facturas: facturas.length,
                            Facturas: facturasCalculos
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

        // Caso 2: Solo número de medidor (sin cédula jurídica)
        let numeroMedidor: number;
        let afiliadoInfo: any = null;

        if (!dto.Cedula_Juridica && dto.Numero_Medidor) {
            const medidor = await this.medidorRepository.findOne({
                where: { Numero_Medidor: dto.Numero_Medidor },
                relations: ['Afiliado']
            });
            if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

            // Obtener información del afiliado
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
        }

        // Caso 3: Cédula jurídica + número de medidor
        else if (dto.Cedula_Juridica && dto.Numero_Medidor) {
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
        }

        else throw new BadRequestException('Debe proporcionar: (1) Cédula jurídica, (2) Número de medidor, o (3) Ambos datos.');

        // Obtener historial de lecturas
        const historialLecturas = await this.lecturaService.getHistorialLecturasByMedidor(numeroMedidor);

        // Buscar facturas del medidor
        const facturas = await this.facturaRepository
            .createQueryBuilder('factura')
            .leftJoinAndSelect('factura.Lectura', 'lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('factura.Estado', 'estado')
            .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor })
            .orderBy('factura.Fecha_Emision', 'DESC')
            .getMany();

        if (!facturas || facturas.length === 0) {
            throw new BadRequestException('No se encontraron facturas para el medidor proporcionado.');
        }

        // Mapear la información de las facturas con los cálculos
        const facturasCalculos = facturas.map(factura => ({
            Numero_Factura: factura.Numero_Factura,
            Fecha_Emision: factura.Fecha_Emision,
            Fecha_Vencimiento: factura.Fecha_Vencimiento,
            Calculos: {
                Cargo_Fijo: `₡${Number(factura.Cargo_Fijo).toFixed(2)}`,
                Cargo_Consumo: `₡${Number(factura.Cargo_Consumo).toFixed(2)}`,
                Cargo_Recurso_Hidrico: `₡${Number(factura.Cargo_Recurso_Hidrico || 0).toFixed(2)}`,
                Otros_Cargos: `₡${Number(factura.Otros_Cargos || 0).toFixed(2)}`,
                Subtotal: `₡${Number(factura.Subtotal).toFixed(2)}`,
                Impuestos: `₡${Number(factura.Impuestos).toFixed(2)}`,
                Total: `₡${Number(factura.Total).toFixed(2)}`
            },
            Estado_Factura: {
                Id_Estado: factura.Estado.Id_Estado_Factura,
                Nombre_Estado: factura.Estado.Nombre_Estado
            },
        }));

        // Registrar consulta
        const ConsultaPago = this.consultaPagoRepository.create({
            Cedula_Juridica: dto.Cedula_Juridica,
            Numero_Medidor: numeroMedidor
        });
        await this.consultaPagoRepository.save(ConsultaPago);

        return {
            Numero_Medidor: numeroMedidor,
            Afiliado: afiliadoInfo,
            Historial_Lecturas: historialLecturas,
            Total_Facturas: facturas.length,
            Facturas: facturasCalculos
        };
    }
}