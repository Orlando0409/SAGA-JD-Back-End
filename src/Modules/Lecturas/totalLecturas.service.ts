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

        // Para identificar el tipo de tarifa, se jala la tarifa usando el ID que se recibe por parametro, para asi usar su cargo fijo por mes en los calculos
        const tipoTarifa = await this.tipoTarifaRepository.findOne({ where: { Id_Tipo_Tarifa_Lectura: idTipoTarifa } });
        if (!tipoTarifa) throw new Error('Tipo de tarifa no encontrado');

        //asigna los afiliados activos del metodo a la variable
        const AfiliadosActivosPrueba =400;
        //const AfiliadosActivos = await this.ContarAfiliadosActivos();
        //if (AfiliadosActivos === 0) throw new Error('No hay afiliados activos para calcular el total');

        let Rangos = await this.getRangoAfiliados(idTipoTarifa);
        let RangoAfiliados = Rangos.find(rango =>
            rango.Minimo_Afiliados <= AfiliadosActivosPrueba && rango.Maximo_Afiliados >= AfiliadosActivosPrueba
        );
        if (!RangoAfiliados) throw new Error('No se encontró un rango de afiliados para la cantidad de afiliados activos');

        let rangoId
        let RangoAfiliadosArr = [RangoAfiliados];
        for (const element of RangoAfiliadosArr) {

            rangoId = element.Id_Rango_Afiliados;
        }

        // Jala el consumo del dto para validar el rango de consumo (filtrado por tarifa)
        let RangosConsumo = await this.getRangoConsumo(idTipoTarifa);
        let RangoConsumo = RangosConsumo.find(rango => dto.Metros_Cubicos >= rango.Minimo_M3 && dto.Metros_Cubicos <= rango.Maximo_M3);
        if (!RangoConsumo) throw new Error('No se encontró un rango de consumo');

        // Ajusta el costo del bloque segun el rango de afiliados usando el primer rango como base.
        // Ejemplo residencial: bloque 16-30 base 416 * (298/360) = 344 para rango 101-300.
        const rangoAfiliadosBase = [...Rangos].sort((a, b) => a.Minimo_Afiliados - b.Minimo_Afiliados)[0];

        if (!rangoAfiliadosBase || rangoAfiliadosBase.Costo_Por_M3 <= 0) {
            throw new Error('No se encontró un rango base válido para ajustar el costo por M3');
        }

        const factorRangoAfiliados = RangoAfiliados.Costo_Por_M3 / rangoAfiliadosBase.Costo_Por_M3;
        const costoPorM3Ajustado = Math.round(RangoConsumo.Costo_Por_M3 * factorRangoAfiliados);

        // Variable para almacenar el total final luego de los calculos
        let valorFinalAPagar = 0;

        switch (idTipoTarifa) {
            case 1: //Tarifa Residencial
                // Rango de 1 a 100 afiliados activos
                if (rangoId == 1) {
                    // Rango 1-100 afiliados: usa el costo del bloque sin ajuste adicional (factor 1).

                    if (dto.Metros_Cubicos >= RangoConsumo.Minimo_M3 && dto.Metros_Cubicos <= RangoConsumo.Maximo_M3) {
                        MatematicaParaPago();
                        valorFinalAPagar += tipoTarifa.Cargo_Fijo_Por_Mes;
                        console.log('Valor final a pagar:', valorFinalAPagar);
                    }
                }
                // Rango de 101 a 300 afiliados activos
                else if (rangoId == 2) {
                    // Rango 101-300 afiliados: ajusta el costo del bloque por factor de rango (ej: 416 -> 344).

                    if (dto.Metros_Cubicos >= RangoConsumo.Minimo_M3 && dto.Metros_Cubicos <= RangoConsumo.Maximo_M3) {
                       MatematicaParaPago();
                        valorFinalAPagar += tipoTarifa.Cargo_Fijo_Por_Mes;
                        console.log('Valor final a pagar:', valorFinalAPagar);
                    }
                }


                

                // Rango de 301 a 1000 afiliados activos
                else if (rangoId === 3) {
                    // Calcular total para tarifa 1

                    
                    if (dto.Metros_Cubicos >= RangoConsumo.Minimo_M3 && dto.Metros_Cubicos <= RangoConsumo.Maximo_M3) {
                       MatematicaParaPago();
                        valorFinalAPagar += tipoTarifa.Cargo_Fijo_Por_Mes;
                        console.log('Valor final a pagar:', valorFinalAPagar);
                    }
                }

                // Rango de más de 1000 afiliados activos
                else if (AfiliadosActivosPrueba > 1000) {
                    // Calcular total para tarifa 1
                }
                break;

            case 2:
                // Lógica para el tipo de tarifa 2
                if (AfiliadosActivosPrueba > RangoAfiliados.Minimo_Afiliados && AfiliadosActivosPrueba <= RangoAfiliados.Maximo_Afiliados) {
                    // Calcular total para tarifa 2
                }

                else if (AfiliadosActivosPrueba > 100 && AfiliadosActivosPrueba <= 300) {
                    // Calcular total para tarifa 2
                }

                else if (AfiliadosActivosPrueba > 300 && AfiliadosActivosPrueba <= 1000) {
                    // Calcular total para tarifa 2
                }

                else if (AfiliadosActivosPrueba > 1000) {
                    // Calcular total para tarifa 2
                }
                break;

            case 3:
                // Lógica para el tipo de tarifa 3
                if (AfiliadosActivosPrueba > 1 && AfiliadosActivosPrueba <= 100) {
                    // Calcular total para tarifa 3
                }

                else if (AfiliadosActivosPrueba > 100 && AfiliadosActivosPrueba <= 300) {
                    // Calcular total para tarifa 3
                }

                else if (AfiliadosActivosPrueba > 300 && AfiliadosActivosPrueba <= 1000) {
                    // Calcular total para tarifa 3
                }

                else if (AfiliadosActivosPrueba > 1000) {
                    // Calcular total para tarifa 3
                }
                break;

            case 4:
                // Lógica para el tipo de tarifa 4
                if (AfiliadosActivosPrueba > 1 && AfiliadosActivosPrueba <= 100) {
                    // Calcular total para tarifa 4
                }

                else if (AfiliadosActivosPrueba > 100 && AfiliadosActivosPrueba <= 300) {
                    // Calcular total para tarifa 4
                }

                else if (AfiliadosActivosPrueba > 300 && AfiliadosActivosPrueba <= 1000) {
                    // Calcular total para tarifa 4
                }

                else if (AfiliadosActivosPrueba > 1000) {
                    // Calcular total para tarifa 4
                }
                break;

            case 5:
                // Lógica para el tipo de tarifa 5
                if (AfiliadosActivosPrueba > 1 && AfiliadosActivosPrueba <= 100) {
                    // Calcular total para tarifa 5
                }

                else if (AfiliadosActivosPrueba > 100 && AfiliadosActivosPrueba <= 300) {
                    // Calcular total para tarifa 5
                }

                else if (AfiliadosActivosPrueba > 300 && AfiliadosActivosPrueba <= 1000) {
                    // Calcular total para tarifa 5
                }

                else if (AfiliadosActivosPrueba > 1000) {
                    // Calcular total para tarifa 5
                }
                break;

            case 6:
                // Lógica para el tipo de tarifa 6
                if (AfiliadosActivosPrueba > 1 && AfiliadosActivosPrueba <= 100) {
                    // Calcular total para tarifa 6
                }

                else if (AfiliadosActivosPrueba > 100 && AfiliadosActivosPrueba <= 300) {
                    // Calcular total para tarifa 6
                }

                else if (AfiliadosActivosPrueba > 300 && AfiliadosActivosPrueba <= 1000) {
                    // Calcular total para tarifa 6
                }

                else if (AfiliadosActivosPrueba > 1000) {
                    // Calcular total para tarifa 6
                }
                break;

            case 7:
                // Lógica para el tipo de tarifa 7
                if (AfiliadosActivosPrueba > 1 && AfiliadosActivosPrueba <= 100) {
                    // Calcular total para tarifa 7
                }

                else if (AfiliadosActivosPrueba > 100 && AfiliadosActivosPrueba <= 300) {
                    // Calcular total para tarifa 7
                }

                else if (AfiliadosActivosPrueba > 300 && AfiliadosActivosPrueba <= 1000) {
                    // Calcular total para tarifa 7
                }

                else if (AfiliadosActivosPrueba > 1000) {
                    // Calcular total para tarifa 7
                }
                break;

            case 8:
                // Lógica para el tipo de tarifa 8
                if (AfiliadosActivosPrueba > 1 && AfiliadosActivosPrueba <= 100) {
                    // Calcular total para tarifa 8
                }

                else if (AfiliadosActivosPrueba > 100 && AfiliadosActivosPrueba <= 300) {
                    // Calcular total para tarifa 8
                }

                else if (AfiliadosActivosPrueba > 300 && AfiliadosActivosPrueba <= 1000) {
                    // Calcular total para tarifa 8
                }

                else if (AfiliadosActivosPrueba > 1000) {
                    // Calcular total para tarifa 8
                }
                break;

            default:
                throw new Error('Tipo de tarifa no válido');
        }

        return valorFinalAPagar;


        function MatematicaParaPago() {
        // Lógica para realizar los cálculos matemáticos necesarios para determinar el total a pagar por una lectura específica, considerando el tipo de tarifa, el rango de afiliados y el rango de consumo.
        // Este método puede ser llamado dentro del método CalcularTotalAPagar para mantener la lógica de negocio organizada y modularizada.

            for (let i = 0; i < dto.Metros_Cubicos; i++) {
                    valorFinalAPagar += costoPorM3Ajustado;
                    console.log('Valor agregado por consumo:', costoPorM3Ajustado);            
                }

                return valorFinalAPagar; // Retorna el resultado del cálculo matemático (este es un valor de ejemplo, se debe reemplazar con el resultado real).
            }
        }

}