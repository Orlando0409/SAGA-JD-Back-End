import { BadRequestException, Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Lectura } from "./LecturaEntities/Lectura.Entity";
import { Repository } from "typeorm";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";
import { Afiliado } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { CreateLecturaDTO } from "./LecturaDTO'S/CreateLectura.dto";
import { EstadoMedidor } from "../Inventario/InventarioEntities/EstadoMedidor.Entity";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { AuditoriaService } from "../Auditoria/auditoria.service";
import { UpdateLecturaDTO } from "./LecturaDTO'S/UpdateLectura.dto";
import { MedidorService } from "../Inventario/Services/medidor.service";
import { AfiliadosService } from "../Afiliados/afiliados.service";
import { Readable } from "stream";
import * as csvParser from "csv-parser";
import { AplicarSelloCalidad } from "./LecturaEntities/AplicarSelloCalidad.Entity";
import { TarifaLecturaConSello } from "../Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaLecturaConSello.Entity";
import { CargoFijoTarifasConSello } from "../Tarifas/Con Sello Calidad/TarifaConSelloEntities/CargoFijoTarifasConSello.Entity";
import { FacturaService } from "../Facturas/factura.service";

@Injectable()
export class LecturaService {
    constructor(
        @InjectRepository(Lectura)
        private readonly lecturaRepository: Repository<Lectura>,

        @InjectRepository(Afiliado)
        private readonly afiliadoRepository: Repository<Afiliado>,

        @InjectRepository(Medidor)
        private readonly medidorRepository: Repository<Medidor>,

        @InjectRepository(EstadoMedidor)
        private readonly estadoMedidorRepository: Repository<EstadoMedidor>,

        @InjectRepository(TarifaLecturaConSello)
        private readonly tipoTarifaLecturaRepository: Repository<TarifaLecturaConSello>,

        @InjectRepository(CargoFijoTarifasConSello)
        private readonly tipoTarifaServiciosFijosRepository: Repository<CargoFijoTarifasConSello>,

        @InjectRepository(TarifaLecturaConSello)
        private readonly tipoTarifaVentaAguaRepository: Repository<TarifaLecturaConSello>,

        @InjectRepository(AplicarSelloCalidad)
        private readonly aplicarSelloCalidadRepository: Repository<AplicarSelloCalidad>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @Inject(forwardRef(() => AuditoriaService))
        private readonly auditoriaService: AuditoriaService,

        @Inject(forwardRef(() => UsuariosService))
        private readonly usuariosService: UsuariosService,

        @Inject(forwardRef(() => MedidorService))
        private readonly medidorService: MedidorService,

        @Inject(forwardRef(() => AfiliadosService))
        private readonly afiliadosService: AfiliadosService,

        @Inject(forwardRef(() => FacturaService))
        private readonly facturaService: FacturaService,
    ) { }

    async getAllLecturas() {
        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .leftJoinAndSelect('lectura.Tipo_Tarifa', 'tipoTarifa')
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Tipo_Tarifa: lectura.Tipo_Tarifa ? {
                Id_Tarifa_Lectura: lectura.Tipo_Tarifa.Id_Tarifa_Lectura,
                Nombre_Tipo_Tarifa: lectura.Tipo_Tarifa.Nombre_Tipo_Tarifa,
            } : null,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lectura.Usuario)
        })));
    }

    //Obtiene las ultimas 5 lecturas hechas para el medidor especifico
    async getHistorialLecturasByMedidor(numeroMedidor: number) {
        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('lectura.Tipo_Tarifa', 'tipoTarifa')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor })
            .orderBy('lectura.Fecha_Lectura', 'DESC')
            .limit(5)
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Tipo_Tarifa: lectura.Tipo_Tarifa ? {
                Id_Tarifa_Lectura: lectura.Tipo_Tarifa.Id_Tarifa_Lectura,
                Nombre_Tipo_Tarifa: lectura.Tipo_Tarifa.Nombre_Tipo_Tarifa,
            } : null,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado)
        })));
    }

    //Obtiene la ultima lectura hecha para el medidor especifico
    async getUltimaLecturaByMedidor(numeroMedidor: number) {
        const lectura = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('lectura.Tipo_Tarifa', 'tipoTarifa')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor })
            .orderBy('lectura.Fecha_Lectura', 'DESC')
            .getOne();

        if (!lectura) throw new Error('No se encontró ninguna lectura para el número de medidor proporcionado.');

        return {
            "Tipo de Tarifa": lectura.Tipo_Tarifa,
            "Consumo Calculado M3": lectura.Consumo_Calculado_M3
        }
    }

    async getTarifasLecturas() {
        return await this.tipoTarifaLecturaRepository.find();
    }

    async getLecturasByUsuario(idUsuario: number) {
        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .leftJoinAndSelect('lectura.Tipo_Tarifa', 'tipoTarifa')
            .where('usuario.Id_Usuario = :idUsuario', { idUsuario })
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Tipo_Tarifa: lectura.Tipo_Tarifa ? {
                Id_Tarifa_Lectura: lectura.Tipo_Tarifa.Id_Tarifa_Lectura,
                Nombre_Tipo_Tarifa: lectura.Tipo_Tarifa.Nombre_Tipo_Tarifa,
            } : null,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lectura.Usuario)
        })));
    }

    async getLecturasByAfiliado(idAfiliado: number) {
        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .leftJoinAndSelect('lectura.Tipo_Tarifa', 'tipoTarifa')
            .where('afiliado.Id_Afiliado = :idAfiliado', { idAfiliado })
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Tipo_Tarifa: lectura.Tipo_Tarifa ? {
                Id_Tarifa_Lectura: lectura.Tipo_Tarifa.Id_Tarifa_Lectura,
                Nombre_Tipo_Tarifa: lectura.Tipo_Tarifa.Nombre_Tipo_Tarifa,
            } : null,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lectura.Usuario)
        })));
    }

    async getLecturasByMedidor(numeroMedidor: number) {
        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .leftJoinAndSelect('lectura.Tipo_Tarifa', 'tipoTarifa')
            .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor })
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Tipo_Tarifa: lectura.Tipo_Tarifa ? {
                Id_Tarifa_Lectura: lectura.Tipo_Tarifa.Id_Tarifa_Lectura,
                Nombre_Tipo_Tarifa: lectura.Tipo_Tarifa.Nombre_Tipo_Tarifa,
            } : null,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lectura.Usuario)
        })));
    }

    async getLecturasEntreFechas(fechaInicio: string, fechaFin: string) {
        function parseDDMMYYYY(dateStr: string): Date {
            // Espera formato DD-MM-YYYY
            const [day, month, year] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        }

        const fechaInicioDate = parseDDMMYYYY(fechaInicio);
        const fechaFinDate = parseDDMMYYYY(fechaFin);
        fechaFinDate.setDate(fechaFinDate.getDate() + 1);

        if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) throw new BadRequestException('Fechas inválidas');

        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .leftJoinAndSelect('lectura.Tipo_Tarifa', 'tipoTarifa')
            .where('lectura.Fecha_Lectura BETWEEN :fechaInicio AND :fechaFin', { fechaInicio: fechaInicioDate, fechaFin: fechaFinDate })
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Tipo_Tarifa: lectura.Tipo_Tarifa ? {
                Id_Tarifa_Lectura: lectura.Tipo_Tarifa.Id_Tarifa_Lectura,
                Nombre_Tipo_Tarifa: lectura.Tipo_Tarifa.Nombre_Tipo_Tarifa,
            } : null,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lectura.Usuario)
        })));
    }

    async getLecturasByMesAnio(mes: number, anio: number) {
        if (isNaN(mes) || isNaN(anio) || mes < 1 || mes > 12) throw new BadRequestException('Mes o año inválidos');

        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .leftJoinAndSelect('lectura.Tipo_Tarifa', 'tipoTarifa')
            .where('MONTH(lectura.Fecha_Lectura) = :mes AND YEAR(lectura.Fecha_Lectura) = :anio', { mes, anio })
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Tipo_Tarifa: lectura.Tipo_Tarifa ? {
                Id_Tarifa_Lectura: lectura.Tipo_Tarifa.Id_Tarifa_Lectura,
                Nombre_Tipo_Tarifa: lectura.Tipo_Tarifa.Nombre_Tipo_Tarifa,
            } : null,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lectura.Usuario)
        })));
    }

    async importarArchivoCSV(CSV: Express.Multer.File, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const resultados: any[] = [];
        const stream = Readable.from(CSV.buffer);
        const errores: string[] = [];
        const advertencias: string[] = [];
        let lecturasCreadas = 0;

        return new Promise((resolve, reject) => {
            stream
                .pipe(csvParser())
                .on('data', (data) => resultados.push(data))
                .on('end', async () => {
                    try {
                        for (let i = 0; i < resultados.length; i++) {
                            const row = resultados[i];
                            const lineNumber = i + 2; // +2 porque: +1 por índice base 0, +1 por fila de encabezado

                            try {
                                // Validar campos requeridos
                                if (!row.Numero_Medidor) {
                                    errores.push(`Fila ${lineNumber}: Número de medidor es requerido`);
                                    continue;
                                }

                                if (!row.Valor_Lectura_Actual) {
                                    errores.push(`Fila ${lineNumber}: Valor de lectura actual es requerido`);
                                    continue;
                                }

                                const numeroMedidor = Number(row.Numero_Medidor);
                                const valorLecturaActual = Number(row.Valor_Lectura_Actual);

                                // Validar que sean números válidos
                                if (isNaN(numeroMedidor)) {
                                    errores.push(`Fila ${lineNumber}: Número de medidor inválido: ${row.Numero_Medidor}`);
                                    continue;
                                }

                                if (isNaN(valorLecturaActual) || valorLecturaActual < 0) {
                                    errores.push(`Fila ${lineNumber}: Valor de lectura inválido: ${row.Valor_Lectura_Actual}`);
                                    continue;
                                }

                                // Buscar medidor con sus relaciones
                                const medidor = await this.medidorRepository.findOne({
                                    where: { Numero_Medidor: numeroMedidor },
                                    relations: ['Estado_Medidor', 'Afiliado']
                                });

                                if (!medidor) {
                                    advertencias.push(`Fila ${lineNumber}: Medidor ${numeroMedidor} no encontrado`);
                                    continue;
                                }

                                // Validar que el medidor tenga un afiliado asociado
                                if (!medidor.Afiliado) {
                                    advertencias.push(`Fila ${lineNumber}: Medidor ${numeroMedidor} no tiene un afiliado asociado`);
                                    continue;
                                }

                                // Validar estado del medidor
                                if (medidor.Estado_Medidor?.Id_Estado_Medidor !== 2) {
                                    advertencias.push(`Fila ${lineNumber}: Medidor ${numeroMedidor} no está instalado`);
                                    continue;
                                }

                                // Identificar afiliado vinculado al medidor
                                const afiliadoIdentificado = medidor.Afiliado;
                                const infoAfiliado = this.afiliadosService.identificarAfiliado(afiliadoIdentificado);

                                console.log(`Fila ${lineNumber}: Afiliado ${infoAfiliado.tipo} identificado - ID: ${infoAfiliado.id}, Identificación: ${infoAfiliado.identificacion}, Nombre/Razón Social: ${infoAfiliado.nombreCompleto}`);

                                // Buscar la última lectura del medidor para calcular consumo
                                const lecturaAnterior = await this.lecturaRepository.createQueryBuilder('lectura')
                                    .leftJoin('lectura.Medidor', 'medidor')
                                    .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor })
                                    .orderBy('lectura.Fecha_Lectura', 'DESC')
                                    .limit(1)
                                    .getOne();

                                let valorLecturaAnterior = 0;
                                let consumoCalculado = valorLecturaActual;

                                if (lecturaAnterior) {
                                    valorLecturaAnterior = lecturaAnterior.Valor_Lectura_Actual;
                                    consumoCalculado = valorLecturaActual - valorLecturaAnterior;

                                    // Validar que la nueva lectura no sea menor que la anterior
                                    if (valorLecturaActual < valorLecturaAnterior) {
                                        errores.push(`Fila ${lineNumber}: Lectura actual (${valorLecturaActual}) es menor que la anterior (${valorLecturaAnterior})`);
                                        continue;
                                    }
                                }

                                // Parsear fecha si existe, si no usar fecha actual
                                let fechaLectura = new Date();
                                if (row.Fecha_Lectura) {
                                    const fechaParsed = new Date(row.Fecha_Lectura);
                                    if (!isNaN(fechaParsed.getTime())) {
                                        fechaLectura = fechaParsed;
                                    } else {
                                        advertencias.push(`Fila ${lineNumber}: Fecha inválida, usando fecha actual`);
                                    }
                                }

                                // Obtener la tarifa (usar la primera disponible o una específica del CSV)
                                let tipoTarifa: TarifaLecturaConSello | null = null;

                                if (row.Id_Tipo_Tarifa_Lectura) {
                                    const idTarifa = Number(row.Id_Tipo_Tarifa_Lectura);
                                    if (!isNaN(idTarifa)) {
                                        tipoTarifa = await this.tipoTarifaLecturaRepository.findOne({
                                            where: { Id_Tarifa_Lectura: idTarifa }
                                        });
                                    }
                                }

                                // Si no se especificó tarifa o no se encontró, usar la primera disponible
                                if (!tipoTarifa) {
                                    tipoTarifa = await this.tipoTarifaLecturaRepository.findOne({
                                        order: { Id_Tarifa_Lectura: 'ASC' }
                                    });

                                    if (!tipoTarifa) {
                                        errores.push(`Fila ${lineNumber}: No hay tarifas disponibles en el sistema`);
                                        continue;
                                    }
                                }

                                // Crear nueva lectura
                                const nuevaLectura = this.lecturaRepository.create({
                                    Medidor: medidor,
                                    Valor_Lectura_Anterior: valorLecturaAnterior,
                                    Valor_Lectura_Actual: valorLecturaActual,
                                    Consumo_Calculado_M3: consumoCalculado,
                                    Fecha_Lectura: fechaLectura,
                                    Tipo_Tarifa: tipoTarifa,
                                    Usuario: usuario
                                });

                                const lecturaGuardada = await this.lecturaRepository.save(nuevaLectura);
                                lecturasCreadas++;

                                // Registrar en auditoría
                                try {
                                    await this.auditoriaService.logCreacion('Lecturas', idUsuario, lecturaGuardada.Id_Lectura, {
                                        Lectura_Anterior: lecturaGuardada.Valor_Lectura_Anterior,
                                        Lectura_Actual: lecturaGuardada.Valor_Lectura_Actual,
                                        Consumo_Calculado_M3: lecturaGuardada.Consumo_Calculado_M3,
                                        Fecha_Lectura: lecturaGuardada.Fecha_Lectura,
                                        Numero_Medidor: medidor.Numero_Medidor,
                                        Id_Afiliado: infoAfiliado.id,
                                        Tipo_Afiliado: infoAfiliado.tipo,
                                        Identificacion_Afiliado: infoAfiliado.identificacion,
                                        Nombre_Afiliado: infoAfiliado.nombreCompleto,
                                        Detalles_Afiliado: infoAfiliado.detalles,
                                        Origen: 'Importación CSV'
                                    });
                                } catch (error) {
                                    console.error(`Error al registrar auditoría para lectura de medidor ${numeroMedidor}:`, error);
                                }

                                // Intentar generar factura automáticamente
                                try {
                                    await this.facturaService.generarFacturaDesdeLectura(lecturaGuardada.Id_Lectura);
                                    advertencias.push(`Línea ${lineNumber}: Lectura y factura creadas exitosamente para medidor ${numeroMedidor}`);
                                } catch (facturaError: any) {
                                    advertencias.push(`Línea ${lineNumber}: Lectura creada pero falló generación de factura para medidor ${numeroMedidor}: ${facturaError?.message || 'Error desconocido'}`);
                                }

                            } catch (rowError: any) {
                                errores.push(`Fila ${lineNumber}: Error procesando registro - ${rowError?.message || 'Error desconocido'}`);
                                console.error(`Error en fila ${lineNumber}:`, rowError);
                            }
                        }

                        resolve({
                            Mensaje: 'Archivo procesado',
                            Resultados: {
                                'Filas Totales': resultados.length,
                                'Lecturas Creadas': lecturasCreadas,
                                'Errores': errores.length,
                                'Advertencias': advertencias.length,
                                'Detalles de Errores': errores.length > 0 ? errores : undefined,
                                'Detalles de Advertencias': advertencias.length > 0 ? advertencias : undefined
                            }
                        });
                    } catch (error: any) {
                        console.error('Error procesando archivo CSV:', error);
                        reject(new BadRequestException(`Error procesando archivo CSV: ${error?.message || 'Error desconocido'}`));
                    }
                })
                .on('error', (error) => {
                    console.error('Error leyendo archivo CSV:', error);
                    reject(new BadRequestException(`Error leyendo archivo CSV: ${error.message}`));
                });
        });
    }

    async createLectura(dto: CreateLecturaDTO, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const medidor = await this.medidorRepository.findOne({
            where: { Numero_Medidor: dto.Numero_Medidor },
            relations: ['Estado_Medidor', 'Afiliado', 'Afiliado.Tipo_Afiliado', 'Afiliado.Estado']
        });
        if (!medidor) throw new BadRequestException('El medidor especificado no existe.');

        // Validar que el medidor tenga un afiliado asociado
        if (!medidor.Afiliado) throw new BadRequestException(`El medidor ${dto.Numero_Medidor} no tiene un afiliado asociado. Debe asignar un afiliado al medidor antes de registrar lecturas.`);
        if (medidor.Estado_Medidor.Id_Estado_Medidor !== 2) throw new BadRequestException('El medidor no está en un estado válido para registrar lecturas.');

        // Identificar afiliado vinculado al medidor
        const afiliadoIdentificado = medidor.Afiliado;
        const infoAfiliado = this.afiliadosService.identificarAfiliado(afiliadoIdentificado);

        if (await this.getSelloCalidad() == true) {
            
        }

        else if (await this.getSelloCalidad() == false) {
            const tipoTarifa = await this.tipoTarifaLecturaRepository.findOne({ where: { Id_Tarifa_Lectura: dto.Id_Tipo_Tarifa } });
            if (!tipoTarifa) throw new BadRequestException('La tarifa especificada no existe');

            // Obtener la lectura anterior más reciente del mismo medidor (filtrando por Numero_Medidor)
            const lecturaAnterior = await this.lecturaRepository.createQueryBuilder('lectura')
                .leftJoin('lectura.Medidor', 'medidor')
                .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor: dto.Numero_Medidor })
                .orderBy('lectura.Fecha_Lectura', 'DESC')
                .limit(1)
                .getOne();

            let valorLecturaAnterior = 0;
            let consumoCalculado = dto.Valor_Lectura;

            // Si existe una lectura anterior, calcular el consumo como la diferencia
            if (lecturaAnterior) {
                valorLecturaAnterior = lecturaAnterior.Valor_Lectura_Actual;
                consumoCalculado = dto.Valor_Lectura - valorLecturaAnterior;

                if (dto.Valor_Lectura < valorLecturaAnterior) throw new BadRequestException(`La lectura actual (${dto.Valor_Lectura}) no puede ser menor que la lectura anterior (${valorLecturaAnterior})`);
            }

            const nuevaLectura = this.lecturaRepository.create({
                Tipo_Tarifa: tipoTarifa,
                Valor_Lectura_Anterior: valorLecturaAnterior,
                Valor_Lectura_Actual: dto.Valor_Lectura,
                Consumo_Calculado_M3: consumoCalculado,
                Medidor: medidor,
                Usuario: usuario,
            });

            const lecturaGuardada = await this.lecturaRepository.save(nuevaLectura);

            // Registrar en auditoría
            try {
                await this.auditoriaService.logCreacion('Lecturas', idUsuario, lecturaGuardada.Id_Lectura, {
                    Lectura_Anterior: lecturaGuardada.Valor_Lectura_Anterior,
                    Lectura_Actual: lecturaGuardada.Valor_Lectura_Actual,
                    Consumo_Calculado_M3: lecturaGuardada.Consumo_Calculado_M3,
                    Fecha_Lectura: lecturaGuardada.Fecha_Lectura,
                    Numero_Medidor: medidor.Numero_Medidor,
                    Id_Afiliado: infoAfiliado.id,
                    Tipo_Afiliado: infoAfiliado.tipo,
                    Identificacion_Afiliado: infoAfiliado.identificacion,
                    Nombre_Afiliado: infoAfiliado.nombreCompleto,
                    Detalles_Afiliado: infoAfiliado.detalles
                });
            } catch (error) {
                console.error('Error al registrar auditoría de creación de lectura:', error);
            }

            // Generar factura automáticamente
            try {
                const facturaGenerada = await this.facturaService.generarFacturaDesdeLectura(lecturaGuardada.Id_Lectura);
                console.log(`✅ Factura ${facturaGenerada.Numero_Factura} generada automáticamente para lectura ${lecturaGuardada.Id_Lectura}`);
            } catch (facturaError: any) {
                console.error(`⚠️ Error generando factura para lectura ${lecturaGuardada.Id_Lectura}:`, facturaError?.message || 'Error desconocido');
                // No lanzar error, solo registrar advertencia
            }

            return {
                Id_Lectura: lecturaGuardada.Id_Lectura,
                Tipo_Tarifa: tipoTarifa ? {
                    Id_Tarifa_Lectura: tipoTarifa.Id_Tarifa_Lectura,
                    Nombre_Tipo_Tarifa: tipoTarifa.Nombre_Tipo_Tarifa,
                } : null,
                Valor_Lectura_Anterior: lecturaGuardada.Valor_Lectura_Anterior,
                Valor_Lectura_Actual: lecturaGuardada.Valor_Lectura_Actual,
                Consumo_Calculado_M3: lecturaGuardada.Consumo_Calculado_M3,
                Fecha_Lectura: lecturaGuardada.Fecha_Lectura,
                Medidor: this.medidorService.formatearMedidorResponse(medidor),
                Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(medidor.Afiliado),
                Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
            };
        }

        else throw new BadRequestException('Error al verificar el estado del sello de calidad. No se pudo determinar si el sello de calidad está activo o no.');

    }

    async updateLectura(dto: UpdateLecturaDTO, idLectura: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const lectura = await this.lecturaRepository.findOne({ where: { Id_Lectura: idLectura } });
        if (!lectura) throw new BadRequestException('La lectura especificada no existe.');

        const datosAnteriores = {
            Id_Tipo_Tarifa: lectura.Tipo_Tarifa,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura
        }

        // Si se actualiza el valor de la lectura, recalcular el consumo
        if (dto.Valor_Lectura !== undefined) {
            const valorAnterior = lectura.Valor_Lectura_Anterior;

            // Validar que la nueva lectura no sea menor que la anterior
            if (dto.Valor_Lectura < valorAnterior) throw new BadRequestException(`La lectura actual (${dto.Valor_Lectura}) no puede ser menor que la lectura anterior (${valorAnterior})`);

            lectura.Valor_Lectura_Actual = dto.Valor_Lectura;
            lectura.Consumo_Calculado_M3 = dto.Valor_Lectura - valorAnterior;
        }

        const lecturaActualizada = await this.lecturaRepository.save(lectura);

        // Cargar las relaciones necesarias para el response
        const lecturaCompleta = await this.lecturaRepository.findOne({
            where: { Id_Lectura: lecturaActualizada.Id_Lectura },
            relations: ['Medidor', 'Medidor.Estado_Medidor', 'Medidor.Afiliado', 'Medidor.Afiliado.Tipo_Afiliado', 'Medidor.Afiliado.Estado', 'Tipo_Tarifa', 'Usuario']
        });

        if (!lecturaCompleta) throw new BadRequestException('No se pudo cargar la lectura actualizada');

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Lecturas', idUsuario, lecturaActualizada.Id_Lectura, datosAnteriores, {
                Id_Tipo_Tarifa: lecturaActualizada.Tipo_Tarifa,
                Consumo_Calculado_M3: lecturaActualizada.Consumo_Calculado_M3,
                Valor_Lectura_Actual: lecturaActualizada.Valor_Lectura_Actual,
                Valor_Lectura_Anterior: lecturaActualizada.Valor_Lectura_Anterior,
                Fecha_Lectura: lecturaActualizada.Fecha_Lectura
            });
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de lectura:', error);
        }

        return {
            Id_Lectura: lecturaCompleta.Id_Lectura,
            Tipo_Tarifa: lecturaCompleta.Tipo_Tarifa ? {
                Id_Tarifa_Lectura: lecturaCompleta.Tipo_Tarifa.Id_Tarifa_Lectura,
                Nombre_Tipo_Tarifa: lecturaCompleta.Tipo_Tarifa.Nombre_Tipo_Tarifa,
            } : null,
            Valor_Lectura_Anterior: lecturaCompleta.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lecturaCompleta.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lecturaCompleta.Consumo_Calculado_M3,
            Fecha_Lectura: lecturaCompleta.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lecturaCompleta.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lecturaCompleta.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lecturaCompleta.Usuario)
        };
    }

    async APlicarSelloALecturas(idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const Sello = await this.aplicarSelloCalidadRepository.findOne({ where: { Id_Aplicar_Sello_Calidad: 1 } });
        if (!Sello) throw new BadRequestException('No se encontró la configuración para aplicar sello de calidad');

        // Alternar el estado del sello (toggle)
        Sello.Aplicar_Sello_Calidad = !Sello.Aplicar_Sello_Calidad;
        await this.aplicarSelloCalidadRepository.save(Sello);

        return Sello.Aplicar_Sello_Calidad
            ? 'Sello de calidad aplicado a las lecturas'
            : 'Sello de calidad removido de las lecturas';
    }

    async getSelloCalidad() {
        const Sello = await this.aplicarSelloCalidadRepository.findOne({ where: { Id_Aplicar_Sello_Calidad: 1 } });
        if (!Sello) throw new BadRequestException('No se encontró la configuración para aplicar sello de calidad');

        return Sello.Aplicar_Sello_Calidad;
    }
}