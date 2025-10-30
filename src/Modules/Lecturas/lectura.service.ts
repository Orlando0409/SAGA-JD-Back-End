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
import { TipoTarifaLectura } from "./LecturaEntities/TipoTarifaLectura.Entity";
import { TipoTarifaServiciosFijos } from "./LecturaEntities/TipoTarifaServiciosFijos.Entity";
import { TipoTarifaVentaAgua } from "./LecturaEntities/TipoTarifaVentaAgua.Entity";

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

        @InjectRepository(TipoTarifaLectura)
        private readonly tipoTarifaLecturaRepository: Repository<TipoTarifaLectura>,

        @InjectRepository(TipoTarifaServiciosFijos)
        private readonly tipoTarifaServiciosFijosRepository: Repository<TipoTarifaServiciosFijos>,

        @InjectRepository(TipoTarifaVentaAgua)
        private readonly tipoTarifaVentaAguaRepository: Repository<TipoTarifaVentaAgua>,

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
    ) { }

    async getAllLecturas() {
        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lectura.Usuario)
        })));
    }

    async getTarifasLecturas() {
        return await this.tipoTarifaLecturaRepository.find();
    }

    async getLecturasByAfiliado(idAfiliado: number) {
        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .where('afiliado.Id_Afiliado = :idAfiliado', { idAfiliado })
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lectura.Usuario)
        })));
    }

    async getLecturasByUsuario(idUsuario: number) {
        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .where('usuario.Id_Usuario = :idUsuario', { idUsuario })
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
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
            .where('medidor.Numero_Medidor = :numeroMedidor', { numeroMedidor })
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
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

        if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
            throw new BadRequestException('Fechas inválidas');
        }

        const lecturas = await this.lecturaRepository.createQueryBuilder('lectura')
            .leftJoinAndSelect('lectura.Medidor', 'medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estadoMedidor')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estadoAfiliado')
            .leftJoinAndSelect('lectura.Usuario', 'usuario')
            .where('lectura.Fecha_Lectura BETWEEN :fechaInicio AND :fechaFin', { fechaInicio: fechaInicioDate, fechaFin: fechaFinDate })
            .getMany();

        return Promise.all(lecturas.map(async lectura => ({
            Id_Lectura: lectura.Id_Lectura,
            Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lectura.Consumo_Calculado_M3,
            Fecha_Lectura: lectura.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lectura.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lectura.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lectura.Usuario)
        })));
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
        if (medidor.Estado_Medidor.Id_Estado_Medidor !== 2) throw new BadRequestException('El medidor no está en un estado válido para registrar lecturas.');

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

            if (dto.Valor_Lectura < valorLecturaAnterior) {
                throw new BadRequestException(`La lectura actual (${dto.Valor_Lectura}) no puede ser menor que la lectura anterior (${valorLecturaAnterior})`);
            }
        }

        const nuevaLectura = this.lecturaRepository.create({
            Valor_Lectura_Anterior: valorLecturaAnterior,
            Valor_Lectura_Actual: dto.Valor_Lectura,
            Consumo_Calculado_M3: consumoCalculado,
            Medidor: medidor,
        });

        const lecturaGuardada = await this.lecturaRepository.save(nuevaLectura);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion('Lecturas', idUsuario, lecturaGuardada.Id_Lectura, {
                Lectura_Anterior: lecturaGuardada.Valor_Lectura_Anterior,
                Lectura_Actual: lecturaGuardada.Valor_Lectura_Actual,
                Consumo_Calculado_M3: lecturaGuardada.Consumo_Calculado_M3,
                Fecha_Lectura: lecturaGuardada.Fecha_Lectura,
                Numero_Medidor: medidor.Numero_Medidor
            });
        } catch (error) {
            console.error('Error al registrar auditoría de creación de lectura:', error);
        }

        return {
            Id_Lectura: lecturaGuardada.Id_Lectura,
            Valor_Lectura_Anterior: lecturaGuardada.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lecturaGuardada.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lecturaGuardada.Consumo_Calculado_M3,
            Fecha_Lectura: lecturaGuardada.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(medidor.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        };
    }

    async updateLectura(dto: UpdateLecturaDTO, idLectura: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const lectura = await this.lecturaRepository.findOne({ where: { Id_Lectura: idLectura } });
        if (!lectura) throw new BadRequestException('La lectura especificada no existe.');

        const datosAnteriores = {
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
            relations: ['Medidor', 'Medidor.Estado_Medidor', 'Medidor.Afiliado', 'Medidor.Afiliado.Tipo_Afiliado', 'Medidor.Afiliado.Estado']
        });

        if (!lecturaCompleta) throw new BadRequestException('No se pudo cargar la lectura actualizada');

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Lecturas', idUsuario, lecturaActualizada.Id_Lectura, datosAnteriores, {
                Consumo_Calculado_M3: lecturaActualizada.Consumo_Calculado_M3,
                Valor_Lectura_Actual: lecturaActualizada.Valor_Lectura_Actual,
                Valor_Lectura_Anterior: lecturaActualizada.Valor_Lectura_Anterior,
                Fecha_Creacion: lecturaActualizada.Fecha_Lectura
            });
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de lectura:', error);
        }

        return {
            Id_Lectura: lecturaCompleta.Id_Lectura,
            Valor_Lectura_Anterior: lecturaCompleta.Valor_Lectura_Anterior,
            Valor_Lectura_Actual: lecturaCompleta.Valor_Lectura_Actual,
            Consumo_Calculado_M3: lecturaCompleta.Consumo_Calculado_M3,
            Fecha_Lectura: lecturaCompleta.Fecha_Lectura,
            Medidor: this.medidorService.formatearMedidorResponse(lecturaCompleta.Medidor),
            Afiliado: await this.afiliadosService.FormatearAfiliadoParaResponseSimple(lecturaCompleta.Medidor?.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(lecturaCompleta.Usuario)
        };
    }
}