import { TipoIdentificacion } from 'src/Common/Enums/TipoIdentificacion.enum';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { TipoTarifaLectura } from "../Lecturas/LecturaEntities/TipoTarifaLectura.Entity";
import { Lectura } from "../Lecturas/LecturaEntities/Lectura.Entity";

@Injectable()
export class PagosService {
    constructor(
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
    ) { }

    async getPagosByAfiliadoFisico(Tipo: TipoIdentificacion, Identificacion: string) {
        if (Tipo === TipoIdentificacion.CEDULA) {
            const afiliado = await this.afiliadoFisicoRepository.findOne({
                where: { Identificacion: Identificacion },
                relations: ['Afiliado', 'Afiliado.Medidores', 'Afiliado.Medidores.Lecturas', 'Afiliado.Medidores.Lecturas.Tipo_Tarifa_Lectura']
            });
        }

        else if (Tipo === TipoIdentificacion.DIMEX) {
            const afiliado = await this.afiliadoFisicoRepository.findOne({
                where: { Identificacion: Identificacion },
                relations: ['Afiliado', 'Afiliado.Medidores', 'Afiliado.Medidores.Lecturas', 'Afiliado.Medidores.Lecturas.Tipo_Tarifa_Lectura']
            });
        }

        else if (Tipo === TipoIdentificacion.PASAPORTE) {
            const afiliado = await this.afiliadoFisicoRepository.findOne({
                where: { Identificacion: Identificacion },
                relations: ['Afiliado', 'Afiliado.Medidores', 'Afiliado.Medidores.Lecturas', 'Afiliado.Medidores.Lecturas.Tipo_Tarifa_Lectura']
            });
        }

        else {
            throw new Error('Tipo de identificación no válido para afiliado físico. Debe ser CEDULA, DIMEX o PASAPORTE.');
        }
    }

    async getPagosByAfiliadoJuridico(Cedula_Juridica: string) {
        const afiliado = await this.afiliadoJuridicoRepository.findOne({
            where: { Cedula_Juridica: Cedula_Juridica },
            relations: ['Afiliado', 'Afiliado.Medidores', 'Afiliado.Medidores.Lecturas', 'Afiliado.Medidores.Lecturas.Tipo_Tarifa_Lectura']
        });

        if (!afiliado) throw new Error('No se encontró un afiliado jurídico con la cédula jurídica proporcionada.');
    }
}