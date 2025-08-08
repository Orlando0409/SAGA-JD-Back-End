import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto_Base } from './Entidades_proyecto/entidadBase_proyecto';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto_Base)
    private proyectoRepository: Repository<Proyecto_Base>,
  ) {}

  AllProyects(): Promise<Proyecto_Base[]> {
    return this.proyectoRepository.find({ relations: ['estado'] });
  }
}
