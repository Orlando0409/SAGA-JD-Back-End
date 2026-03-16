import { RangoAfiliados } from 'src/Modules/Lecturas/LecturaEntities/RangoAfiliados.Entity';
import { Afiliado } from 'src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Lectura } from "./LecturaEntities/Lectura.Entity";
import { Repository } from "typeorm";
import { TipoTarifaLectura } from "./LecturaEntities/TipoTarifaLectura.Entity";
import { TipoTarifaServiciosFijos } from "./LecturaEntities/TipoTarifaServiciosFijos.Entity";
import { TipoTarifaVentaAgua } from "./LecturaEntities/TipoTarifaVentaAgua.Entity";
import { EstadoAfiliado } from '../Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { getTotalPorM3DTO } from './LecturaDTO\'S/getTotalPorM3.dto';
import { RangoConsumo } from './LecturaEntities/RangoConsumo.Entity';
import { CargoFijoTarifas } from './LecturaEntities/CargoFijoTarifas.Entity';
import { TipoTarifaCargoFijo } from './LecturaEntities/TipoTarifaCargoFijo.Entity';

export class totalLecturasService {
    constructor(
        @InjectRepository(Lectura)
        private readonly lecturaRepository: Repository<Lectura>,

        @InjectRepository(TipoTarifaLectura)
        private readonly tipoTarifaRepository: Repository<TipoTarifaLectura>,

        @InjectRepository(TipoTarifaServiciosFijos)
        private readonly tipoTarifaServiciosFijosRepository: Repository<TipoTarifaServiciosFijos>,

        @InjectRepository(TipoTarifaVentaAgua)
        private readonly tipoTarifaVentaAguaRepository: Repository<TipoTarifaVentaAgua>,

        @InjectRepository(RangoConsumo)
        private readonly rangoConsumoRepository: Repository<RangoConsumo>,

        @InjectRepository(RangoAfiliados)
        private readonly rangoAfiliadosRepository: Repository<RangoAfiliados>,

        @InjectRepository(CargoFijoTarifas)
        private readonly cargoFijoTarifasRepository: Repository<CargoFijoTarifas>,

        @InjectRepository(TipoTarifaCargoFijo)
        private readonly tipoTarifaCargoFijoRepository: Repository<TipoTarifaCargoFijo>,

        @InjectRepository(Afiliado)
        private readonly afiliadoRepository: Repository<Afiliado>,

        @InjectRepository(EstadoAfiliado)
        private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>
    ) { }

    // Metodo para contar la cantidad de afiliados activos
    async ContarAfiliadosActivos(): Promise<number> {
        return await this.afiliadoRepository.count({
            where: { Estado: { Id_Estado_Afiliado: 1 } }
        });
    }

    // Metodo para obtener el cargo fijo según el tipo de tarifa y el rango de afiliados
    async getCargoFijo(idTipoTarifa: number, idRangoAfiliados: number): Promise<CargoFijoTarifas> {
        const relacion = await this.tipoTarifaCargoFijoRepository.findOne({
            where: {
                Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: idTipoTarifa },
                Rango_Afiliados: { Id_Rango_Afiliados: idRangoAfiliados }
            },
            relations: ['Cargo_Fijo']
        });

        if (!relacion) throw new Error(`No se encontró un cargo fijo para el tipo de tarifa ${idTipoTarifa} y rango de afiliados ${idRangoAfiliados}`);
        return relacion.Cargo_Fijo;
    }

    // Metodo para obtener los rangos de afiliados filtrado por tarifa (minimo, maximo, costo por M3 y el ID)
    async getRangoAfiliados(idTipoTarifa: number) {
        const Rangos = await this.rangoAfiliadosRepository.find({
            where: { Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: idTipoTarifa } },
            relations: ['Tipo_Tarifa']
        });

        return Rangos.map(rango => ({
            Id_Rango_Afiliados: rango.Id_Rango_Afiliados,
            Minimo_Afiliados: rango.Minimo_Afiliados,
            Maximo_Afiliados: rango.Maximo_Afiliados,
            Costo_Por_M3: rango.Costo_Por_M3
        }));
    }

    // Metodo para obtener los bloques de consumo filtrado por tarifa
    async getRangoConsumo(idTipoTarifa: number) {
        const Rangos = await this.rangoConsumoRepository.find({
            where: { Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: idTipoTarifa } },
            relations: ['Tipo_Tarifa']
        });

        return Rangos.map(rango => ({
            Id_Rango_Consumo: rango.Id_Rango_Consumo,
            Minimo_M3: rango.Minimo_M3,
            Maximo_M3: rango.Maximo_M3,
            Costo_Por_M3: rango.Costo_Por_M3
        }));
    }

    async CalcularTotalAPagar(dto: getTotalPorM3DTO, idTipoTarifa: number): Promise<number> {
        /*
            Hay 3 entidades a tener en cuenta para los calculos de los afiliados,
            estas siendo: tipoTarifa, RangoAfiliados y RangoConsumo

            tipoTarifa se encarga de identificar que tarifa se debe aplicar al calculo, Residencial, Comercial, etc.
            RangoAfiliados se encarga de identificar cuantos afiliados activos hay, para asi saber cuanto menos se cobra.
            RangoConsumo se encarga de identificar el rango de consumo de agua para calcular el costo por M3 usando el RangoAfiliados.
        */

        // Para identificar el tipo de tarifa, se jala la tarifa usando el ID que se recibe por parametro
        const tipoTarifa = await this.tipoTarifaRepository.findOne({ where: { Id_Tipo_Tarifa_Lectura: idTipoTarifa } });
        if (!tipoTarifa) throw new Error('Tipo de tarifa no encontrado');

        // Obtiene la cantidad de afiliados activos
        const afiliadosActivos = await this.ContarAfiliadosActivos();

        // Busca el rango de afiliados que corresponde a la cantidad actual
        let Rangos = await this.getRangoAfiliados(idTipoTarifa);
        let RangoAfiliados = Rangos.find(rango =>
            rango.Minimo_Afiliados <= afiliadosActivos && rango.Maximo_Afiliados >= afiliadosActivos
        );
        if (!RangoAfiliados) throw new Error('No se encontró un rango de afiliados para la cantidad de afiliados activos');

        // Obtiene el cargo fijo correspondiente al tipo de tarifa y rango de afiliados
        const cargoFijo = await this.getCargoFijo(idTipoTarifa, RangoAfiliados.Id_Rango_Afiliados);

        // Jala el consumo del dto para validar el rango de consumo (filtrado por tarifa)
        let RangosConsumo = await this.getRangoConsumo(idTipoTarifa);
        let RangoConsumo = RangosConsumo.find(rango => dto.Metros_Cubicos >= rango.Minimo_M3 && dto.Metros_Cubicos <= rango.Maximo_M3);
        if (!RangoConsumo) throw new Error('No se encontró un rango de consumo');

        // Ajusta el costo del bloque segun el rango de afiliados usando el primer rango como base.
        const rangoAfiliadosBase = [...Rangos].sort((a, b) => a.Minimo_Afiliados - b.Minimo_Afiliados)[0];

        if (!rangoAfiliadosBase || rangoAfiliadosBase.Costo_Por_M3 <= 0) throw new Error('No se encontró un rango base válido para ajustar el costo por M3');

        const factorRangoAfiliados = RangoAfiliados.Costo_Por_M3 / rangoAfiliadosBase.Costo_Por_M3;
        const costoPorM3Ajustado = Math.round(RangoConsumo.Costo_Por_M3 * factorRangoAfiliados);

        // Variable para almacenar el total final luego de los calculos
        let valorFinalAPagar = 0;

        // Calcula el costo por consumo de agua
        for (let i = 0; i < dto.Metros_Cubicos; i++) {
            valorFinalAPagar += costoPorM3Ajustado;
            console.log('Valor agregado por consumo:', costoPorM3Ajustado);
        }

        // Agrega el cargo fijo mensual
        valorFinalAPagar += cargoFijo.Cargo_Fijo_Por_Mes;
        console.log('Cargo fijo agregado:', cargoFijo.Cargo_Fijo_Por_Mes);
        console.log('Valor final a pagar:', valorFinalAPagar);

        return valorFinalAPagar;
    }
}