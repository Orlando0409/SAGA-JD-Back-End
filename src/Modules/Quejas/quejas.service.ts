
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { EmailService } from '../Emails/email.service';
import { CreateQuejaDto } from './QuejaDTO\'s/CreateQueja.dto';
import { ResponderQuejaDto } from './QuejaDTO\'s/ResponderQueja.dto';
import { Queja } from './QuejaEntities/QuejasEntity';
import { UsuariosService } from '../Usuarios/Services/usuarios.service';
import { AuditoriaService } from '../Auditoria/auditoria.service';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { EstadoQueja } from './QuejaEntities/EstadoQueja.Entity';

interface QuejaFiles {
  Adjunto?: Express.Multer.File[];
}

@Injectable()
export class QuejasService {
  private readonly logger = new Logger(QuejasService.name);

  constructor(
    @InjectRepository(Queja)
    private readonly quejasRepository: Repository<Queja>,

    @InjectRepository(EstadoQueja)
    private readonly estadoQuejaRepository: Repository<EstadoQueja>,

    private readonly dropboxFilesService: DropboxFilesService,

    private readonly emailService: EmailService,

    private readonly usuariosService: UsuariosService,

    private readonly auditoriaService: AuditoriaService,
    
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) { }

  async getAll() {
    return this.quejasRepository.find({ relations: ['Estado'] });
  }

  async getOne(id: number) {
    const repo = await this.quejasRepository.findOne({ where: { Id_Queja: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Queja con id ${id} no encontrada`);
    return repo;
  }

  async create(dto: CreateQuejaDto, files?: QuejaFiles) {
    const estado = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: 1 } });
    if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const nombre = dto.Nombre?.toString().trim();
    const primerApellido = dto.Primer_Apellido?.toString().trim();
    const segundoApellido = dto.Segundo_Apellido?.toString().trim();
    const rawFolder = [nombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
    const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();

    const quejaData = {
      ...dto,
      Estado: estado,
    };

    const saved = await this.quejasRepository.save(quejaData);

    const adjuntoUrls: string[] = [];
    if (files?.Adjunto) {
      const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Quejas', undefined, folderName);
        if (res?.url) adjuntoUrls.push(res.url);
      }

      saved.Adjunto = adjuntoUrls;
      await this.quejasRepository.save(saved);
    }

    if (dto.Correo) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailQueja({
            name: dto.Nombre,
            Papellido: dto.Primer_Apellido,
            Sapellido: dto.Segundo_Apellido,
            Correo: dto.Correo,
            descripcion: dto.Descripcion,
            adjuntos: adjuntoUrls,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de queja:', error);
        }
      });
    }

    return saved;
  }

  async updateEstado(id: number, nuevoEstadoId: number, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la queja');

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

    const repo = await this.quejasRepository.findOne({ where: { Id_Queja: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Queja con id ${id} no encontrada`);

    const nuevoEstado = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: nuevoEstadoId } });
    if (!nuevoEstado) throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);

    const datosAnteriores = { Id_Estado_Queja: repo.Estado.Id_Estado_Queja };

    repo.Estado = nuevoEstado;
    await this.quejasRepository.save(repo);

    try {
      await this.auditoriaService.logActualizacion('Quejas', idUsuario, id, datosAnteriores, { Id_Estado_Queja: nuevoEstadoId });
    } catch (error) {
      this.logger.error('Error al registrar auditoría de actualización de queja:', error);
    }
    return repo;
  }

  async responderQueja(id: number, dto: ResponderQuejaDto , idUsuario: number) {

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

    const repo = await this.quejasRepository.findOne({
      where: { Id_Queja: id },
      relations: ['Estado']
    });
    if (!repo) throw new BadRequestException(`Queja con id ${id} no encontrada`);

    repo.RespuestasReporte = dto.Respuesta;
    const estadoContestada = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: 2 } });
    if (!estadoContestada) throw new BadRequestException('Estado contestada no encontrado');

    const datosAnteriores = { Respuesta_Reporte: repo.RespuestasReporte };

    repo.Estado = estadoContestada;
    const updatedQueja = await this.quejasRepository.save(repo);

    const correoDestino = repo.Correo;
    if (correoDestino) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailRespuestaQueja({
            name: repo.Nombre,
            Papellido: repo.Primer_Apellido,
            Sapellido: repo.Segundo_Apellido,
            Correo: correoDestino,
            descripcion: repo.Descripcion,
            respuesta: dto.Respuesta,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de respuesta de queja:', error);
        }
      });
    } else {
      this.logger.warn(`No se puede enviar email de respuesta de queja: correo no disponible para ID ${id}`);
    }

    try{
      await this.auditoriaService.logActualizacion('Quejas', idUsuario, id, datosAnteriores, { Respuesta_Reporte: dto.Respuesta });
    }catch (error) {
      this.logger.error('Error al registrar auditoría de respuesta de queja:', error);
    }

    return updatedQueja;
  }
}