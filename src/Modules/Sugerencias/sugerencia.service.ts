import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { EmailService } from '../Emails/email.service';
import { EstadoSugerencia } from './SugerenciaEntities/EstadoSugerencia';
import { Sugerencia } from './SugerenciaEntities/Sugerencia.Entity';
import { CreateSugerenciaDto } from './SugerenciaDTO\'s/CreateSugerencia.dto';
import { ResponderSugerenciaDto } from './SugerenciaDTO\'s/ResponderSugerencia.dto';
import { UsuariosService } from '../Usuarios/Services/usuarios.service';
import { AuditoriaService } from '../Auditoria/auditoria.service';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';

interface SugerenciaFiles {
  Adjunto?: Express.Multer.File[];
}

@Injectable()
export class SugerenciaService {
  private readonly logger = new Logger(SugerenciaService.name);

  constructor(
    @InjectRepository(Sugerencia)
    private readonly sugerenciaRepository: Repository<Sugerencia>,

    @InjectRepository(EstadoSugerencia)
    private readonly estadoRepository: Repository<EstadoSugerencia>,

    private readonly dropboxFilesService: DropboxFilesService,

    private readonly emailService: EmailService,

    private readonly usuariosService: UsuariosService,

    private readonly auditoriaService: AuditoriaService,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

  ) { }

  async getAll() {
    return this.sugerenciaRepository.find({ relations: ['Estado'] });
  }

  async getOne(id: number) {
    const repo = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);
    return repo;
  }

  async create(dto: CreateSugerenciaDto, files?: SugerenciaFiles) {
    const estado = await this.estadoRepository.findOne({ where: { Id_Estado_Sugerencia: 1 } });
    if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const fecha = new Date();
    const sugerenciaData = {
      Mensaje: dto.Mensaje,
      Correo: dto.Correo,
      Fecha_Sugerencia: fecha,
      Estado: estado,
    };

    const saved = await this.sugerenciaRepository.save(sugerenciaData);

    const adjuntoUrls: string[] = [];
    if (files?.Adjunto) {
      const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
      const folderName = `sugerencia_${saved.Id_Sugerencia}`;
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Sugerencias', undefined, folderName);
        if (res?.url) adjuntoUrls.push(res.url);
      }

      saved.Adjunto = adjuntoUrls;
      await this.sugerenciaRepository.save(saved);
    }

    if (dto.Correo) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailSugerencia({
            Correo: dto.Correo,
            Mensaje: dto.Mensaje,
            adjuntos: adjuntoUrls,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de sugerencia:', error);
        }
      });
    }

    return saved;
  }

  async updateEstado(id: number, nuevoEstadoId: number, idUsuario: number) {

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

    const repo = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);

    const nuevoEstado = await this.estadoRepository.findOne({ where: { Id_Estado_Sugerencia: nuevoEstadoId } });
    if (!nuevoEstado) throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);

    const datosAnteriores = { Id_Estado_Sugerencia: repo.Estado.Id_Estado_Sugerencia };

    repo.Estado = nuevoEstado;
    await this.sugerenciaRepository.save(repo);

    try{
      await this.auditoriaService.logActualizacion('Sugerencias', idUsuario, id, datosAnteriores, { Id_Estado_Sugerencia: nuevoEstadoId });
    }catch (error) {
      this.logger.error('Error al registrar auditoría de actualización de sugerencia:', error);
    }

    return { ...repo,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
    };
  }

  async responderSugerencia(id: number, dto: ResponderSugerenciaDto, idUsuario: number) {

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

    const repo = await this.sugerenciaRepository.findOne({
      where: { Id_Sugerencia: id },
      relations: ['Estado']
    });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);

    repo.RespuestasSugerencia = dto.Respuesta;
    const estadoContestada = await this.estadoRepository.findOne({ where: { Id_Estado_Sugerencia: 2 } });
    if (!estadoContestada) throw new BadRequestException('Estado contestada no encontrado');

    const datosAnteriores = { Respuestas_Sugerencia: repo.RespuestasSugerencia };

    repo.Estado = estadoContestada;
    const updatedSugerencia = await this.sugerenciaRepository.save(repo);

    const correoDestino = repo.Correo;
    if (correoDestino) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailRespuestaSugerencia({
            Correo: correoDestino,
            Mensaje: repo.Mensaje,
            respuesta: dto.Respuesta,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de respuesta de sugerencia:', error);
        }
      });
    } else {
      this.logger.warn(`No se puede enviar email de respuesta de sugerencia: correo no disponible para ID ${id}`);
    }

    try{
      await this.auditoriaService.logActualizacion('Sugerencias', idUsuario, id, datosAnteriores, { Respuestas_Sugerencia: dto.Respuesta });
    }catch (error) {
      this.logger.error('Error al registrar auditoría de respuesta de sugerencia:', error);
    }

    return {
      ...updatedSugerencia,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
    };
  }
}