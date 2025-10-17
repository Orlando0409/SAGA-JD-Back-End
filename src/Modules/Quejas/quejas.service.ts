import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuejasEntity } from './Entity/QuejasEntity';
import { EstadoQueja } from './Entity/EstadoQueja';
import { CreateQuejaDto } from './Dto/CreateQueja.dto';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { EmailService } from '../Emails/email.service';

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
  ) {}

  async getAll() {
    return this.quejasRepository.find({ relations: ['Estado'] });
  }

  async getOne(id: number) {
    const repo = await this.quejasRepository.findOne({ where: { Id_Queja: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Queja con id ${id} no encontrada`);
    return repo;
  }

  async create(dto: CreateQuejaDto, files?: any) {
    const estado = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: 1 } });
    if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const fecha = new Date();
    const nombre = dto.name?.toString().trim();
    const primerApellido = dto.Papellido?.toString().trim();
    const segundoApellido = dto.Sapellido?.toString().trim();
    const rawFolder = [nombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
    const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();

    const quejaData = {
      ...dto,
      Fecha_Queja: fecha,
      Estado: estado,
    };
    
    const saved = await this.quejasRepository.save(quejaData as any);

    const adjuntoUrls: string[] = [];
    if (files?.Adjunto) {
      const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Quejas', undefined, folderName);
        if (res?.url) adjuntoUrls.push(res.url);
      }

      (saved as any).Adjunto = adjuntoUrls;
      await this.quejasRepository.save(saved as any);
    }

    if (dto.Correo) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailQueja({
            name: dto.name,
            Papellido: dto.Papellido,
            Sapellido: dto.Sapellido,
            Correo: dto.Correo,
            descripcion: dto.descripcion,
            adjuntos: adjuntoUrls,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de queja:', error);
        }
      });
    }

    return saved;
  }

  async remove(id: number) {
    const repo = await this.quejasRepository.findOne({ where: { Id_Queja: id } });
    if (!repo) throw new BadRequestException(`Queja con id ${id} no encontrada`);

    try {
      const nombre = repo.name?.toString().trim();
      const primerApellido = repo.Papellido?.toString().trim();
      const segundoApellido = repo.Sapellido?.toString().trim();
      const rawFolder = [nombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
      const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();
      await this.dropboxFilesService.deletePath('Contacto', 'Quejas', undefined, folderName);
    } catch (err) {
      console.warn(`No se pudo eliminar carpeta en Dropbox para queja ${id}: ${err}`);
    }

    return this.quejasRepository.remove(repo);
  }

  async updateEstado(id: number, nuevoEstadoId: number) {
    const repo = await this.quejasRepository.findOne({ where: { Id_Queja: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Queja con id ${id} no encontrada`);

    const nuevoEstado = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: nuevoEstadoId } });
    if (!nuevoEstado) throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);

    repo.Estado = nuevoEstado;
    return this.quejasRepository.save(repo);
  }

  async responderQueja(id: number, respuesta: string) {
    const repo = await this.quejasRepository.findOne({ 
      where: { Id_Queja: id }, 
      relations: ['Estado'] 
    });
    if (!repo) throw new BadRequestException(`Queja con id ${id} no encontrada`);

    repo.RespuestasReporte = respuesta;
    const estadoContestada = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: 2 } });
    if (!estadoContestada) throw new BadRequestException('Estado contestada no encontrado');

    repo.Estado = estadoContestada;
    const updatedQueja = await this.quejasRepository.save(repo);

    const correoDestino = (repo as any).Correo;
    if (correoDestino) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailRespuestaQueja({
            name: repo.name,
            Papellido: repo.Papellido,
            Sapellido: repo.Sapellido,
            Correo: correoDestino,
            descripcion: repo.descripcion,
            respuesta: respuesta,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de respuesta de queja:', error);
        }
      });
    } else {
      this.logger.warn(`No se puede enviar email de respuesta de queja: correo no disponible para ID ${id}`);
    }

    return updatedQueja;
  }
}
