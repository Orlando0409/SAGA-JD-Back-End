import { totalLecturasService } from '../Lecturas/totalLecturas.service';
import { TipoIdentificacion } from 'src/Common/Enums/TipoIdentificacion.enum';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { TipoTarifaLectura } from "../Lecturas/LecturaEntities/TipoTarifaLectura.Entity";
import { Lectura } from "../Lecturas/LecturaEntities/Lectura.Entity";
import { LecturaService } from '../Lecturas/lectura.service';
import { ConsultaPago } from './ConsultaPagoEntities/ConsultaPago.entity';
import { ConsultaFisicaDTO } from './ConsultaPagoDTO\'S/consultaFisica.dto';

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

        private readonly totalLecturasService: totalLecturasService
    ) { }

    async getConsultaPagosByAfiliadoFisico(dto: ConsultaFisicaDTO) {
        if (dto.Tipo_Identificacion){
            if (dto.Tipo_Identificacion != TipoIdentificacion.CEDULA && dto.Tipo_Identificacion != TipoIdentificacion.DIMEX && dto.Tipo_Identificacion != TipoIdentificacion.PASAPORTE) {
                throw new Error('Tipo de identificación no válido para afiliado físico. Debe ser CEDULA, DIMEX o PASAPORTE.');
            }
        }

        // AfiliadoFisico hereda de Afiliado, por lo que tiene acceso directo a Medidores
        const afiliado = await this.afiliadoFisicoRepository.findOne({
            where: { Identificacion: dto.Identificacion },
            relations: ['Medidores', 'Medidores.Lecturas', 'Medidores.Lecturas.Tipo_Tarifa']
        });
        if (!afiliado) throw new Error('No se encontró un afiliado físico con la identificación proporcionada.');

        // Buscar el medidor específico dentro de los medidores del afiliado
        const medidor = afiliado.Medidores?.find(m => m.Numero_Medidor === dto.Numero_Medidor);
        if (!medidor) throw new Error('No se encontró un medidor con el número proporcionado asociado a esta identificación.');

        const ultimaLectura = await this.lecturaService.getUltimaLecturaByMedidor(medidor.Numero_Medidor);
        if (!ultimaLectura) throw new Error('No se encontró ninguna lectura para el medidor proporcionado.');

        const tipoTarifa = ultimaLectura['Tipo de Tarifa'];
        if (!tipoTarifa) throw new Error('La última lectura no tiene un tipo de tarifa asociado.');

        const ConsultaPago = this.consultaPagoRepository.create({
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Numero_Medidor: dto.Numero_Medidor
        });
        await this.consultaPagoRepository.save(ConsultaPago);

        return this.totalLecturasService.CalcularTotalAPagar(ultimaLectura['Consumo Calculado M3'], tipoTarifa['Id_Tipo_Tarifa_Lectura']);
    }

    async getConsultaPagosByAfiliadoJuridico(Cedula_Juridica: string) {
        // AfiliadoJuridico hereda de Afiliado, por lo que tiene acceso directo a Medidores
        const afiliado = await this.afiliadoJuridicoRepository.findOne({
            where: { Cedula_Juridica: Cedula_Juridica },
            relations: ['Medidores', 'Medidores.Lecturas', 'Medidores.Lecturas.Tipo_Tarifa']
        });

        if (!afiliado) throw new Error('No se encontró un afiliado jurídico con la cédula jurídica proporcionada.');
    }
}