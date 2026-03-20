import { ConsultaJuridicaDTO } from './ConsultaPagoDTO\'S/consultaJuridica.dto';
import { totalLecturasService } from '../Lecturas/totalLecturas.service';
import { TipoIdentificacion } from 'src/Common/Enums/TipoIdentificacion.enum';
import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { TipoTarifaLectura } from "../Lecturas/LecturaEntities/TipoTarifaLectura.Entity";
import { Lectura } from "../Lecturas/LecturaEntities/Lectura.Entity";
import { LecturaService } from '../Lecturas/lectura.service';
import { ConsultaPago } from './ConsultaPagoEntities/ConsultaPago.entity';
import { ConsultaFisicaDTO } from './ConsultaPagoDTO\'S/consultaFisica.dto';
import { ValidationsService } from 'src/Validations/Validations.service';

@Injectable()
export class PagosService {
    constructor(
        @InjectRepository(ConsultaPago)
        private readonly consultaPagoRepository: Repository<ConsultaPago>,

        @InjectRepository(Lectura)
        private readonly lecturaRepository: Repository<Lectura>,

        @InjectRepository(TipoTarifaLectura)
        private readonly tipoTarifaLecturaRepository: Repository<TipoTarifaLectura>,

        @InjectRepository(Afiliado)
        private readonly afiliadoRepository: Repository<Afiliado>,

        @InjectRepository(AfiliadoFisico)
        private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(AfiliadoJuridico)
        private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>,

        @InjectRepository(Medidor)
        private readonly medidorRepository: Repository<Medidor>,

        private readonly lecturaService: LecturaService,

        private readonly totalLecturasService: totalLecturasService,

        private readonly validationsService: ValidationsService
    ) { }

    async getConsultaPagosByMedidor(numeroMedidor: number) {
        const medidor = await this.medidorRepository.findOne({
            where: { Numero_Medidor: numeroMedidor },
            relations: ['Estado_Medidor']
        });
        if (!medidor) throw new BadRequestException('No se encontró un medidor con el número proporcionado.');

        const estadoMedidor = medidor.Estado_Medidor.Id_Estado_Medidor;
        if (estadoMedidor === 1 || estadoMedidor === 3) throw new BadRequestException('El medidor esta inactivo o suspendido.');

        const ultimaLectura = await this.lecturaService.getUltimaLecturaByMedidor(numeroMedidor);
        if (!ultimaLectura) throw new BadRequestException('No se encontró ninguna lectura para el medidor proporcionado.');

        const tipoTarifa = ultimaLectura['Tipo de Tarifa'];
        if (!tipoTarifa) throw new BadRequestException('La última lectura no tiene un tipo de tarifa asociado.');

        const historial_Lecturas = await this.lecturaService.getHistorialLecturasByMedidor(numeroMedidor);

        const total_A_Pagar = await this.totalLecturasService.CalcularTotalAPagar(
            ultimaLectura['Consumo Calculado M3'], 
            tipoTarifa['Id_Tipo_Tarifa_Lectura']
        );

        const ConsultaPago = this.consultaPagoRepository.create({
            Numero_Medidor: numeroMedidor
        });
        await this.consultaPagoRepository.save(ConsultaPago);

        return {
            Numero_Medidor: numeroMedidor,
            "Calculo final": total_A_Pagar,
            "Historial de lecturas": historial_Lecturas
        };
    }

    async getConsultaPagosByAfiliadoFisico(dto: ConsultaFisicaDTO) {
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
            } catch (error) {
                throw new BadRequestException(error.message);
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
                        const ultimaLectura = await this.lecturaService.getUltimaLecturaByMedidor(medidor.Numero_Medidor);
                        const tipoTarifa = ultimaLectura['Tipo de Tarifa'];
                        const historial_Lecturas = await this.lecturaService.getHistorialLecturasByMedidor(medidor.Numero_Medidor);
                        const total_A_Pagar = await this.totalLecturasService.CalcularTotalAPagar(
                            ultimaLectura['Consumo Calculado M3'],
                            tipoTarifa['Id_Tipo_Tarifa_Lectura']
                        );

                        // Registrar consulta para cada medidor
                        const ConsultaPago = this.consultaPagoRepository.create({
                            Tipo_Identificacion: dto.Tipo_Identificacion,
                            Identificacion: dto.Identificacion,
                            Numero_Medidor: medidor.Numero_Medidor
                        });
                        await this.consultaPagoRepository.save(ConsultaPago);

                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            "Calculo final": total_A_Pagar,
                            "Historial de lecturas": historial_Lecturas
                        };
                    } catch (error) {
                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            BadRequestException: `No se pudo obtener información: ${error.message}`
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
            } catch (error) {
                throw new BadRequestException(error.message);
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

        else {
            throw new BadRequestException('Debe proporcionar: (1) Tipo de identificación + Identificación, (2) Número de medidor, o (3) Los tres datos.');
        }

        // Obtener la última lectura del medidor
        const ultimaLectura = await this.lecturaService.getUltimaLecturaByMedidor(numeroMedidor);
        if (!ultimaLectura) throw new BadRequestException('No se encontró ninguna lectura para el medidor proporcionado.');

        const tipoTarifa = ultimaLectura['Tipo de Tarifa'];
        if (!tipoTarifa) throw new BadRequestException('La última lectura no tiene un tipo de tarifa asociado.');

        const historial_Lecturas = await this.lecturaService.getHistorialLecturasByMedidor(numeroMedidor);

        const total_A_Pagar = await this.totalLecturasService.CalcularTotalAPagar(
            ultimaLectura['Consumo Calculado M3'], 
            tipoTarifa['Id_Tipo_Tarifa_Lectura']
        );

        const ConsultaPago = this.consultaPagoRepository.create({
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Numero_Medidor: numeroMedidor
        });
        await this.consultaPagoRepository.save(ConsultaPago);

        return {
            Numero_Medidor: numeroMedidor,
            "Calculo final": total_A_Pagar,
            "Historial de lecturas": historial_Lecturas
        };
    }

    async getConsultaPagosByAfiliadoJuridico(dto: ConsultaJuridicaDTO) {
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
                        const ultimaLectura = await this.lecturaService.getUltimaLecturaByMedidor(medidor.Numero_Medidor);
                        const tipoTarifa = ultimaLectura['Tipo de Tarifa'];
                        const historial_Lecturas = await this.lecturaService.getHistorialLecturasByMedidor(medidor.Numero_Medidor);
                        const total_A_Pagar = await this.totalLecturasService.CalcularTotalAPagar(
                            ultimaLectura['Consumo Calculado M3'],
                            tipoTarifa['Id_Tipo_Tarifa_Lectura']
                        );

                        // Registrar consulta para cada medidor
                        const ConsultaPago = this.consultaPagoRepository.create({
                            Cedula_Juridica: dto.Cedula_Juridica,
                            Numero_Medidor: medidor.Numero_Medidor
                        });
                        await this.consultaPagoRepository.save(ConsultaPago);

                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            "Calculo final": total_A_Pagar,
                            "Historial de lecturas": historial_Lecturas
                        };
                    } catch (error) {
                        return {
                            Numero_Medidor: medidor.Numero_Medidor,
                            BadRequestException: `No se pudo obtener información: ${error.message}`
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

        const ultimaLectura = await this.lecturaService.getUltimaLecturaByMedidor(numeroMedidor);
        if (!ultimaLectura) throw new BadRequestException('No se encontró ninguna lectura para el medidor proporcionado.');

        const tipoTarifa = ultimaLectura['Tipo de Tarifa'];
        if (!tipoTarifa) throw new BadRequestException('La última lectura no tiene un tipo de tarifa asociado.');

        const historial_Lecturas = await this.lecturaService.getHistorialLecturasByMedidor(numeroMedidor);

        const total_A_Pagar = await this.totalLecturasService.CalcularTotalAPagar(
            ultimaLectura['Consumo Calculado M3'], 
            tipoTarifa['Id_Tipo_Tarifa_Lectura']
        );

        return {
            Numero_Medidor: numeroMedidor,
            "Calculo final": total_A_Pagar,
            "Historial de lecturas": historial_Lecturas
        };
    }
}