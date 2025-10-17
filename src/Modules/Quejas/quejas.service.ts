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
    @InjectRepository(QuejasEntity)
    private readonly quejasRepository: Repository<QuejasEntity>,

    @InjectRepository(EstadoQueja)
    private readonly estadoQuejaRepository: Repository<EstadoQueja>,

    private readonly dropboxFilesService: DropboxFilesService,
    private readonly emailService: EmailService,
  ) {}

  async getAll() {
    return this.quejasRepository.find({ relations: ['Estado'] });
  }

  async getOne(id: number) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de queja invalido: ${id}`);
    const ent = await this.quejasRepository.findOne({ where: { Id_Queja: idNum }, relations: ['Estado'] });
    if (!ent) throw new BadRequestException(`Queja con id ${idNum} no encontrada`);
    return ent;
  }

  async create(dto: CreateQuejaDto, files?: any) {
  const estado = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: 1 } });
  if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const fecha = new Date();
  const nombre = (dto.name)?.toString().trim();
  const primerApellido = (dto.Papellido)?.toString().trim();
  const segundoApellido = (dto.Sapellido)?.toString().trim();

  const fullName = nombre;
  const rawFolder = [fullName, primerApellido, segundoApellido].filter(Boolean).join(' ');
  const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();

  const archivosAdjuntos: string[] = [];
  if (files?.Adjunto) {
    const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
    for (const file of archivos) {
      const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Quejas', undefined, folderName);
      if (res?.url) archivosAdjuntos.push(res.url);
    }
  }

  const queja = this.quejasRepository.create({
    ...dto,
    Fecha_Queja: fecha,
    Adjunto: archivosAdjuntos,
    Estado: estado,
  });

  const savedQueja = await this.quejasRepository.save(queja);

  // Enviar email de confirmación de queja (sin bloquear)
  if (dto.Correo) {
    setImmediate(async () => {
      try {
        await this.emailService.enviarEmailQueja({
          name: dto.name,
          Papellido: dto.Papellido,
          Sapellido: dto.Sapellido,
          Correo: dto.Correo,
          descripcion: dto.descripcion,
          adjuntos: archivosAdjuntos,
        });
      } catch (error) {
        this.logger.error('Error al enviar email de queja:', error);
      }
    });
  }

  return savedQueja;
  }

  async remove(id: number) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de queja invalido: ${id}`);
    const repo = await this.quejasRepository.findOne({ where: { Id_Queja: idNum } });
  if (!repo) throw new BadRequestException(`Queja con id ${idNum} no encontrada`);

  const nombre = (repo?.name)?.toString().trim();
  const primerApellido = (repo?.Papellido)?.toString().trim();
  const segundoApellido = (repo?.Sapellido)?.toString().trim();
  const rawFolder = [nombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
  const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();

    try {
      await this.dropboxFilesService.deletePath('Contacto', 'Quejas', undefined, folderName);
    } catch (error) {
      this.logger.warn(`No se pudo eliminar carpeta en Dropbox para queja ${idNum}: ${error}`);
    }

    return this.quejasRepository.remove(repo);
  }

  async updateEstado(id: number, nuevoEstadoId: number) {
    const idNum = Number(id);
    const estadoNum = Number(nuevoEstadoId);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de queja invalido: ${id}`);
    if (!Number.isInteger(estadoNum) || estadoNum <= 0) throw new BadRequestException(`Id de estado invalido: ${nuevoEstadoId}`);
    if (![1, 2].includes(estadoNum)) throw new BadRequestException(`Id de estado no permitido: ${estadoNum}`);

    const repo = await this.quejasRepository.findOne({ where: { Id_Queja: idNum }, relations: ['Estado'] });
  if (!repo) throw new BadRequestException(`Queja con id ${idNum} no encontrada`);

    const nuevoEstado = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: estadoNum } });
  if (!nuevoEstado) throw new BadRequestException(`Estado con id ${estadoNum} no encontrado`);

    repo.Estado = nuevoEstado;
    return this.quejasRepository.save(repo);
  }

  async responderQueja(id: number, respuesta: string) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de queja invalido: ${id}`);

    const repo = await this.quejasRepository.findOne({ where: { Id_Queja: idNum }, relations: ['Estado'] });
  if (!repo) throw new BadRequestException(`Queja con id ${idNum} no encontrada`);

    repo.RespuestasReporte = respuesta;

    const estadoContestada = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: 2 } });
  if (!estadoContestada) throw new BadRequestException('Estado contestada (2) no encontrado');

    repo.Estado = estadoContestada;
    const updatedQueja = await this.quejasRepository.save(repo);

    // Enviar email de respuesta de queja (sin bloquear)
    if ((repo as any).Correo) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailRespuestaQueja({
            name: repo.name,
            Papellido: repo.Papellido,
            Sapellido: repo.Sapellido,
            Correo: (repo as any).Correo,
            descripcion: repo.descripcion,
            respuesta: respuesta,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de respuesta de queja:', error);
        }
      });
    }

    return updatedQueja;
  }
}
