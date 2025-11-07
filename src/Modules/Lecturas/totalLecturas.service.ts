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
import { RangoAfiliados } from './LecturaEntities/RangoAfiliados.Entity';

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

    async ContarTotalPorM3(dto: getTotalPorM3DTO, idTipoTarifa: number): Promise<number> {
        if (!idTipoTarifa || idTipoTarifa <= 0) throw new Error('idTipoTarifa debe ser un número positivo mayor que cero');
        if (!dto.Metros_Cubicos || dto.Metros_Cubicos <= 0) throw new Error('Metros_Cubicos debe ser un número positivo mayor que cero');
        if (await this.ContarAfiliadosActivos() === 0) throw new Error('No hay afiliados activos para calcular el total');

        const valorPorM3 = 0;

        switch (idTipoTarifa) {
            case 1:
                // Lógica para el tipo de tarifa 1
                if (await this.ContarAfiliadosActivos() > 1 && await this.ContarAfiliadosActivos() <= 100) {
                    // Calcular total para tarifa 1
                }

                else if (await this.ContarAfiliadosActivos() > 100 && await this.ContarAfiliadosActivos() <= 300) {
                    // Calcular total para tarifa 1
                }

                else if (await this.ContarAfiliadosActivos() > 300 && await this.ContarAfiliadosActivos() <= 1000) {
                    // Calcular total para tarifa 1
                }

                else if (await this.ContarAfiliadosActivos() > 1000) {
                    // Calcular total para tarifa 1
                }
                break;

            case 2:
                // Lógica para el tipo de tarifa 2
                if (await this.ContarAfiliadosActivos() > 1 && await this.ContarAfiliadosActivos() <= 100) {
                    // Calcular total para tarifa 2
                }

                else if (await this.ContarAfiliadosActivos() > 100 && await this.ContarAfiliadosActivos() <= 300) {
                    // Calcular total para tarifa 2
                }

                else if (await this.ContarAfiliadosActivos() > 300 && await this.ContarAfiliadosActivos() <= 1000) {
                    // Calcular total para tarifa 2
                }

                else if (await this.ContarAfiliadosActivos() > 1000) {
                    // Calcular total para tarifa 2
                }
                break;

            case 3:
                // Lógica para el tipo de tarifa 3
                if (await this.ContarAfiliadosActivos() > 1 && await this.ContarAfiliadosActivos() <= 100) {
                    // Calcular total para tarifa 3
                }

                else if (await this.ContarAfiliadosActivos() > 100 && await this.ContarAfiliadosActivos() <= 300) {
                    // Calcular total para tarifa 3
                }

                else if (await this.ContarAfiliadosActivos() > 300 && await this.ContarAfiliadosActivos() <= 1000) {
                    // Calcular total para tarifa 3
                }

                else if (await this.ContarAfiliadosActivos() > 1000) {
                    // Calcular total para tarifa 3
                }
                break;

            case 4:
                // Lógica para el tipo de tarifa 4
                if (await this.ContarAfiliadosActivos() > 1 && await this.ContarAfiliadosActivos() <= 100) {
                    // Calcular total para tarifa 4
                }

                else if (await this.ContarAfiliadosActivos() > 100 && await this.ContarAfiliadosActivos() <= 300) {
                    // Calcular total para tarifa 4
                }

                else if (await this.ContarAfiliadosActivos() > 300 && await this.ContarAfiliadosActivos() <= 1000) {
                    // Calcular total para tarifa 4
                }

                else if (await this.ContarAfiliadosActivos() > 1000) {
                    // Calcular total para tarifa 4
                }
                break;

            case 5:
                // Lógica para el tipo de tarifa 5
                if (await this.ContarAfiliadosActivos() > 1 && await this.ContarAfiliadosActivos() <= 100) {
                    // Calcular total para tarifa 5
                }

                else if (await this.ContarAfiliadosActivos() > 100 && await this.ContarAfiliadosActivos() <= 300) {
                    // Calcular total para tarifa 5
                }

                else if (await this.ContarAfiliadosActivos() > 300 && await this.ContarAfiliadosActivos() <= 1000) {
                    // Calcular total para tarifa 5
                }

                else if (await this.ContarAfiliadosActivos() > 1000) {
                    // Calcular total para tarifa 5
                }
                break;

            case 6:
                // Lógica para el tipo de tarifa 6
                if (await this.ContarAfiliadosActivos() > 1 && await this.ContarAfiliadosActivos() <= 100) {
                    // Calcular total para tarifa 6
                }

                else if (await this.ContarAfiliadosActivos() > 100 && await this.ContarAfiliadosActivos() <= 300) {
                    // Calcular total para tarifa 6
                }

                else if (await this.ContarAfiliadosActivos() > 300 && await this.ContarAfiliadosActivos() <= 1000) {
                    // Calcular total para tarifa 6
                }

                else if (await this.ContarAfiliadosActivos() > 1000) {
                    // Calcular total para tarifa 6
                }
                break;

            case 7:
                // Lógica para el tipo de tarifa 7
                if (await this.ContarAfiliadosActivos() > 1 && await this.ContarAfiliadosActivos() <= 100) {
                    // Calcular total para tarifa 7
                }

                else if (await this.ContarAfiliadosActivos() > 100 && await this.ContarAfiliadosActivos() <= 300) {
                    // Calcular total para tarifa 7
                }

                else if (await this.ContarAfiliadosActivos() > 300 && await this.ContarAfiliadosActivos() <= 1000) {
                    // Calcular total para tarifa 7
                }

                else if (await this.ContarAfiliadosActivos() > 1000) {
                    // Calcular total para tarifa 7
                }
                break;

            case 8:
                // Lógica para el tipo de tarifa 8
                if (await this.ContarAfiliadosActivos() > 1 && await this.ContarAfiliadosActivos() <= 100) {
                    // Calcular total para tarifa 8
                }

                else if (await this.ContarAfiliadosActivos() > 100 && await this.ContarAfiliadosActivos() <= 300) {
                    // Calcular total para tarifa 8
                }

                else if (await this.ContarAfiliadosActivos() > 300 && await this.ContarAfiliadosActivos() <= 1000) {
                    // Calcular total para tarifa 8
                }

                else if (await this.ContarAfiliadosActivos() > 1000) {
                    // Calcular total para tarifa 8
                }
                break;

            default:
                throw new Error('Tipo de tarifa no válido');
        }

        return valorPorM3;
    }
}