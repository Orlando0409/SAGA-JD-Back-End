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

    // Metodo para obtener los rangos de afiliados (minimo, maximo y el ID)
    async getRangoAfiliados() {
        const Rangos = await this.rangoAfiliadosRepository.createQueryBuilder('rangoAfiliados')
        .getMany();

        return Promise.all(Rangos.map(async (rango) => {
            return {
                Id_Rango_Afiliados: rango.Id_Rango_Afiliados,
                Minimo_Afiliados: rango.Minimo_Afiliados,
                Maximo_Afiliados: rango.Maximo_Afiliados
            };
        }));
    }

    async ContarTotalPorM3(dto: getTotalPorM3DTO, idTipoTarifa: number): Promise<number> {
        if (!idTipoTarifa || idTipoTarifa <= 0) throw new Error('El ID de la tarifa debe ser un número positivo mayor que cero');

        //asigna los afiliados cativos del metodo a la variable
        const AfiliadosActivos = await this.ContarAfiliadosActivos();

        if (AfiliadosActivos === 0) throw new Error('No hay afiliados activos para calcular el total');

        // No hace ni pinga
        let Rangos = await this.getRangoAfiliados();

        // Tampoco hace ni pinga
        let RangoAfiliados = Rangos.find(rango => AfiliadosActivos > rango.Minimo_Afiliados && AfiliadosActivos <= rango.Maximo_Afiliados);

        // Jala el consumo del dto para validar el rango de consumo y obtener el costo por M3
        const RangoConsumo = await this.rangoConsumoRepository.findOne({
            where: {
                Minimo_M3: dto.Metros_Cubicos >= 0 ? dto.Metros_Cubicos : 0,
                Maximo_M3: dto.Metros_Cubicos >= 0 ? dto.Metros_Cubicos : 0
            }
        });

        // Jala el costo de M3 del rango de consumo para poder usarlo en la matemática del total a pagar
        const CostoPorM3 = RangoConsumo ? RangoConsumo.Costo_Por_M3 : 0;

        // Variable para almacenar el total final luego de los calculos
        let valorFinalAPagar = 0;

        switch (idTipoTarifa) {
            case 1: //Tarifa Residencial
                if (AfiliadosActivos > RangoAfiliados.Minimo_Afiliados && AfiliadosActivos <= RangoAfiliados.Maximo_Afiliados) {

                    if (dto.Metros_Cubicos > 0 && dto.Metros_Cubicos <= 15) {
                        for (let i = 0; i < dto.Metros_Cubicos; i++) {
                            valorFinalAPagar += CostoPorM3;
                        }
                    }
                }

                else if (AfiliadosActivos > 100 && AfiliadosActivos <= 300) {
                    // Calcular total para tarifa 1
                }

                else if (AfiliadosActivos > 300 && AfiliadosActivos <= 1000) {
                    // Calcular total para tarifa 1
                }

                else if (AfiliadosActivos > 1000) {
                    // Calcular total para tarifa 1
                }
                break;

            case 2:
                // Lógica para el tipo de tarifa 2
                if (AfiliadosActivos > 1 && AfiliadosActivos <= 100) {
                    // Calcular total para tarifa 2
                }

                else if (AfiliadosActivos > 100 && AfiliadosActivos <= 300) {
                    // Calcular total para tarifa 2
                }

                else if (AfiliadosActivos > 300 && AfiliadosActivos <= 1000) {
                    // Calcular total para tarifa 2
                }

                else if (AfiliadosActivos > 1000) {
                    // Calcular total para tarifa 2
                }
                break;

            case 3:
                // Lógica para el tipo de tarifa 3
                if (AfiliadosActivos > 1 && AfiliadosActivos <= 100) {
                    // Calcular total para tarifa 3
                }

                else if (AfiliadosActivos > 100 && AfiliadosActivos <= 300) {
                    // Calcular total para tarifa 3
                }

                else if (AfiliadosActivos > 300 && AfiliadosActivos <= 1000) {
                    // Calcular total para tarifa 3
                }

                else if (AfiliadosActivos > 1000) {
                    // Calcular total para tarifa 3
                }
                break;

            case 4:
                // Lógica para el tipo de tarifa 4
                if (AfiliadosActivos > 1 && AfiliadosActivos <= 100) {
                    // Calcular total para tarifa 4
                }

                else if (AfiliadosActivos > 100 && AfiliadosActivos <= 300) {
                    // Calcular total para tarifa 4
                }

                else if (AfiliadosActivos > 300 && AfiliadosActivos <= 1000) {
                    // Calcular total para tarifa 4
                }

                else if (AfiliadosActivos > 1000) {
                    // Calcular total para tarifa 4
                }
                break;

            case 5:
                // Lógica para el tipo de tarifa 5
                if (AfiliadosActivos > 1 && AfiliadosActivos <= 100) {
                    // Calcular total para tarifa 5
                }

                else if (AfiliadosActivos > 100 && AfiliadosActivos <= 300) {
                    // Calcular total para tarifa 5
                }

                else if (AfiliadosActivos > 300 && AfiliadosActivos <= 1000) {
                    // Calcular total para tarifa 5
                }

                else if (AfiliadosActivos > 1000) {
                    // Calcular total para tarifa 5
                }
                break;

            case 6:
                // Lógica para el tipo de tarifa 6
                if (AfiliadosActivos > 1 && AfiliadosActivos <= 100) {
                    // Calcular total para tarifa 6
                }

                else if (AfiliadosActivos > 100 && AfiliadosActivos <= 300) {
                    // Calcular total para tarifa 6
                }

                else if (AfiliadosActivos > 300 && AfiliadosActivos <= 1000) {
                    // Calcular total para tarifa 6
                }

                else if (AfiliadosActivos > 1000) {
                    // Calcular total para tarifa 6
                }
                break;

            case 7:
                // Lógica para el tipo de tarifa 7
                if (AfiliadosActivos > 1 && AfiliadosActivos <= 100) {
                    // Calcular total para tarifa 7
                }

                else if (AfiliadosActivos > 100 && AfiliadosActivos <= 300) {
                    // Calcular total para tarifa 7
                }

                else if (AfiliadosActivos > 300 && AfiliadosActivos <= 1000) {
                    // Calcular total para tarifa 7
                }

                else if (AfiliadosActivos > 1000) {
                    // Calcular total para tarifa 7
                }
                break;

            case 8:
                // Lógica para el tipo de tarifa 8
                if (AfiliadosActivos > 1 && AfiliadosActivos <= 100) {
                    // Calcular total para tarifa 8
                }

                else if (AfiliadosActivos > 100 && AfiliadosActivos <= 300) {
                    // Calcular total para tarifa 8
                }

                else if (AfiliadosActivos > 300 && AfiliadosActivos <= 1000) {
                    // Calcular total para tarifa 8
                }

                else if (AfiliadosActivos > 1000) {
                    // Calcular total para tarifa 8
                }
                break;

            default:
                throw new Error('Tipo de tarifa no válido');
        }

        return valorFinalAPagar;
    }
}