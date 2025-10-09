import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuejasEntity } from './Entity/QuejasEntity';
import { EstadoQueja } from './Entity/EstadoQueja';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';

@Injectable()
export class QuejasService {
  private readonly logger = new Logger(QuejasService.name);
  constructor(
    @InjectRepository(QuejasEntity)
    private readonly quejasRepository: Repository<QuejasEntity>,

    @InjectRepository(EstadoQueja)
    private readonly estadoQuejaRepository: Repository<EstadoQueja>,

    private readonly dropboxFilesService: DropboxFilesService,
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

  async create(dto: any, files?: any) {
  const estado = await this.estadoQuejaRepository.findOne({ where: { Id_Estado_Queja: 1 } });
  if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const fecha = new Date();

  const nombre = (dto.Nombre || dto.nombre || dto.name || '')?.toString().trim();
  const primerApellido = (dto.Primer_Apellido || dto.primer_apellido || '')?.toString().trim();
  const segundoApellido = (dto.Segundo_Apellido || dto.segundo_apellido || '')?.toString().trim();
  const primerNombre = nombre ? nombre.split(' ')[0] : '';
  const folderName = [primerNombre, primerApellido, segundoApellido].filter(Boolean).join(' ').trim();

    const imagenUrls: string[] = [];
    if (files?.Imagen) {
      const archivos = Array.isArray(files.Imagen) ? files.Imagen : [files.Imagen];
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Quejas', undefined, folderName);
        if (res?.url) imagenUrls.push(res.url);
      }
    }

    const queja = this.quejasRepository.create({
      ...dto,
      Fecha_Queja: fecha,
      Imagen: imagenUrls,
      Estado: estado,
    });

    return this.quejasRepository.save(queja);
  }

  async remove(id: number) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de queja invalido: ${id}`);
    const repo = await this.quejasRepository.findOne({ where: { Id_Queja: idNum } });
  if (!repo) throw new BadRequestException(`Queja con id ${idNum} no encontrada`);

  const nombre = (repo?.Nombre || '').toString().trim();
  const primerNombre = nombre ? nombre.split(' ')[0] : '';
  const primerApellido = (repo?.Primer_Apellido || '').toString().trim();
  const segundoApellido = (repo?.Segundo_Apellido || '').toString().trim();
  const folderName = `${[primerNombre, primerApellido, segundoApellido].filter(Boolean).join(' ')}`.trim();

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
    return this.quejasRepository.save(repo);
  }
}
