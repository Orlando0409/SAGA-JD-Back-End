import { BadRequestException, Injectable } from "@nestjs/common";
import { Medidor } from "../InventarioEntities/Medidor.Entity";
import { IsNull, Not, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { EstadoMedidor } from "../InventarioEntities/EstadoMedidor.Entity";
import { CreateMedidorDTO } from "../InventarioDTO's/CreateMedidor.dto";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { AsignarMedidorDTO } from "../InventarioDTO's/AsignarMedidor.dto";

@Injectable()
export class MedidorService {
    constructor(
        @InjectRepository(Medidor)
        private readonly medidorRepository: Repository<Medidor>,

        @InjectRepository(EstadoMedidor)
        private readonly estadoMedidorRepository: Repository<EstadoMedidor>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(AfiliadoFisico)
        private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(AfiliadoJuridico)
        private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>
    ) { }

    async getAllMedidores() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('medidor.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        return medidores.map(medidor => ({
            ...medidor,
            Afiliado: medidor.Afiliado ? {
                Id_Afiliado: medidor.Afiliado.Id_Afiliado,
                Tipo_Afiliado: medidor.Afiliado.Tipo_Afiliado.Id_Tipo_Afiliado,
                Nombre: (medidor.Afiliado as AfiliadoFisico).Nombre,
                Primer_Apellido: (medidor.Afiliado as AfiliadoFisico).Apellido1,
                Segundo_Apellido: (medidor.Afiliado as AfiliadoFisico).Apellido2,
            } : null,
            Usuario_Creador: medidor.Usuario_Creador ? {
                Id_Usuario: medidor.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: medidor.Usuario_Creador.Nombre_Usuario,
                Id_Rol: medidor.Usuario_Creador.Id_Rol,
                Nombre_Rol: medidor.Usuario_Creador.Rol?.Nombre_Rol
            } : null
        }));
    }

    async getMedidoresNoInstalados() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Id_Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('medidor.Id_Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 1 }) // 1 = No Instalado
            .getMany();

        return medidores.map(medidor => ({
            ...medidor,
            Usuario_Creador: medidor.Usuario_Creador ? {
                Id_Usuario: medidor.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: medidor.Usuario_Creador.Nombre_Usuario,
                Id_Rol: medidor.Usuario_Creador.Id_Rol,
                Nombre_Rol: medidor.Usuario_Creador.Rol?.Nombre_Rol
            } : null
        }));
    }

    async getMedidoresInstalados() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Id_Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('medidor.Id_Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 2 }) // 2 = Instalado
            .getMany();

        return medidores.map(medidor => ({
            ...medidor,
            Usuario_Creador: medidor.Usuario_Creador ? {
                Id_Usuario: medidor.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: medidor.Usuario_Creador.Nombre_Usuario,
                Id_Rol: medidor.Usuario_Creador.Id_Rol,
                Nombre_Rol: medidor.Usuario_Creador.Rol?.Nombre_Rol
            } : null
        }));
    }

    async getMedidoresDañados() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Id_Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('medidor.Id_Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 3 }) // 3 = Dañado
            .getMany();

        return medidores.map(medidor => ({
            ...medidor,
            Usuario_Creador: medidor.Usuario_Creador ? {
                Id_Usuario: medidor.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: medidor.Usuario_Creador.Nombre_Usuario,
                Id_Rol: medidor.Usuario_Creador.Id_Rol,
                Nombre_Rol: medidor.Usuario_Creador.Rol?.Nombre_Rol
            } : null
        }));
    }

    async getMedidoresAfiliado(idAfiliado: number) {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Id_Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('medidor.Id_Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('medidor.Id_Afiliado = :idAfiliado', { idAfiliado })
            .getMany();

        return medidores.map(medidor => ({
            ...medidor,
            Usuario_Creador: medidor.Usuario_Creador ? {
                Id_Usuario: medidor.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: medidor.Usuario_Creador.Nombre_Usuario,
                Id_Rol: medidor.Usuario_Creador.Id_Rol,
                Nombre_Rol: medidor.Usuario_Creador.Rol?.Nombre_Rol
            } : null
        }));
    }

    async createMedidor(dto: CreateMedidorDTO, idUsuarioCreador: number) {
        const MedidorExistente = await this.medidorRepository.findOne({ where: { Numero_Medidor: dto.Numero_Medidor } });
        if (MedidorExistente) { throw new BadRequestException('Ya existe un medidor con ese número.'); }

        const estadoInicial = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado por defecto no encontrado'); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException(`Usuario con ID ${idUsuarioCreador} no encontrado`); }

        const medidor = this.medidorRepository.create({
            ...dto,
            Estado_Medidor: estadoInicial,
            Usuario_Creador: usuario
        });

        const medidorGuardado = await this.medidorRepository.save(medidor);

        // Recargar el medidor con todas sus relaciones
        const medidorCompleto = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('medidor.Id_Medidor = :id', { id: medidorGuardado.Id_Medidor })
            .getOne();

        if (!medidorCompleto) {
            throw new BadRequestException('Error al recuperar el medidor creado');
        }

        return {
            ...medidorCompleto,
            Usuario_Creador: {
                Id_Usuario: medidorCompleto.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: medidorCompleto.Usuario_Creador.Nombre_Usuario,
                Id_Rol: medidorCompleto.Usuario_Creador.Id_Rol,
                Nombre_Rol: medidorCompleto.Usuario_Creador.Rol?.Nombre_Rol
            }
        };
    }

    async asignarMedidorAAfiliado(dto: AsignarMedidorDTO) {
        const medidor = await this.medidorRepository.findOne({ where: { Id_Medidor: dto.Id_Medidor }, relations: ['Estado_Medidor'] });
        if (!medidor) { throw new BadRequestException(`Medidor con ID ${dto.Id_Medidor} no encontrado`); }

        if (medidor.Estado_Medidor.Id_Estado_Medidor === 2) { throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} no está disponible, ya está asignado a un afiliado.`); }
        if (medidor.Estado_Medidor.Id_Estado_Medidor === 3) { throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} está dañado y no puede ser asignado.`); }

        const TipoAfiliadoValido = [1, 2]; // 1 = Físico, 2 = Jurídico
        if (!TipoAfiliadoValido.includes(dto.Id_Tipo_Afiliado)) { throw new BadRequestException(`Tipo de afiliado inválido. Los valores permitidos son: ${TipoAfiliadoValido.join(' y ')}`); }

        let afiliado: Afiliado | null = null;

        if (dto.Id_Tipo_Afiliado === 1) { // Afiliado Físico
            afiliado = await this.afiliadoFisicoRepository.findOneBy({ Id_Afiliado: dto.Id_Afiliado });
            if (!afiliado) { throw new BadRequestException(`Afiliado Físico con ID ${dto.Id_Afiliado} no encontrado`); }
        }

        else if (dto.Id_Tipo_Afiliado === 2) { // Afiliado Jurídico
            afiliado = await this.afiliadoJuridicoRepository.findOneBy({ Id_Afiliado: dto.Id_Afiliado });
            if (!afiliado) { throw new BadRequestException(`Afiliado Jurídico con ID ${dto.Id_Afiliado} no encontrado`); }
        }

        if (!afiliado) throw new BadRequestException('Afiliado no encontrado');

        if (afiliado.Medidores && afiliado.Medidores.length > 0) {
            throw new BadRequestException(`El afiliado con ID ${dto.Id_Afiliado} ya tiene un medidor asignado.`);
        }

        // Asignar el medidor al afiliado
        //afiliado.Medidores.push(medidor);
        //await (dto.Id_Tipo_Afiliado === 1 ? this.afiliadoFisicoRepository.save(afiliado) : this.afiliadoJuridicoRepository.save(afiliado));

        medidor.Estado_Medidor = { Id_Estado_Medidor: 2, Nombre_Estado_Medidor: 'Instalado' } as EstadoMedidor; // Cambiar estado a "Instalado"
        //medidor.Afiliado = afiliado;
        await this.medidorRepository.save(medidor);
        await this.estadoMedidorRepository.save(medidor.Estado_Medidor);

        // Recargar el medidor con todas sus relaciones
        await this.medidorRepository.findOne({ where: { Id_Medidor: medidor.Id_Medidor }, relations: ['Estado_Medidor', 'Usuario_Creador'] });

        const Medidor = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Usuario_Creador', 'usuario')
            .getOne();

        if (!Medidor) { throw new BadRequestException(`Medidor con ID ${dto.Id_Medidor} no encontrado`); }

        return {
            ...Medidor,
            Afiliado: afiliado ? {
                Id_Afiliado: (afiliado as Afiliado).Id_Afiliado,
                Id_Tipo_Afiliado: dto.Id_Tipo_Afiliado,
                Tipo_Identificacion: (afiliado as AfiliadoFisico).Tipo_Identificacion,
                Identificacion: (afiliado as AfiliadoFisico).Identificacion,
                Cedula_Juridica: (afiliado as AfiliadoJuridico).Cedula_Juridica,
                Razon_Social: (afiliado as AfiliadoJuridico).Razon_Social,
                Nombre: (afiliado as AfiliadoFisico).Nombre,
                Primer_Apellido: (afiliado as AfiliadoFisico).Apellido1,
                Segundo_Apellido: (afiliado as AfiliadoFisico).Apellido2,
            } : null,
            Usuario_Creador: Medidor.Usuario_Creador ? {
                Id_Usuario: Medidor.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: Medidor.Usuario_Creador.Nombre_Usuario,
                Id_Rol: Medidor.Usuario_Creador.Id_Rol,
                Nombre_Rol: Medidor.Usuario_Creador.Rol?.Nombre_Rol
            } : null
        };
    }
}