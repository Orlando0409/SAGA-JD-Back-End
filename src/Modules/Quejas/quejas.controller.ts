import { RequierePermisos } from "src/Modules/auth/Decorator/Permiso.decorator";
import { Body, Controller, Get, Param, Post, UploadedFiles, UseInterceptors, Patch, Request } from '@nestjs/common';
import { NumericParamPipe } from 'src/Common/Pipes/numeric-param.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { QuejasService } from './quejas.service';
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateQuejaDto } from './QuejaDTO\'s/CreateQueja.dto';
import { ResponderQuejaDto } from './QuejaDTO\'s/ResponderQueja.dto';
import { UpdateQuejaEstadoDto } from './QuejaDTO\'s/UpdateQuejaEstado.dto';

@Controller('quejas')
export class QuejasController {
  constructor(private readonly quejasService: QuejasService) { }

  @Get()
  @RequierePermisos('quejasugerenciasreportes', 'ver')
  getAll() {
    return this.quejasService.getAll();
  }

  @Get('archivados')
  @RequierePermisos('quejasugerenciasreportes', 'ver')
  getArchivados() {
    return this.quejasService.getAllArchivados();
  }

  @Get('pendientes')
  @RequierePermisos('quejasugerenciasreportes', 'ver')
  getPendientes() {
    return this.quejasService.getAllPendientes();
  }

  @Get('contestadas')
  @RequierePermisos('quejasugerenciasreportes', 'ver')
  getContestadas() {
    return this.quejasService.getAllContestadas();
  }

  @Get(':id')
  @RequierePermisos('quejasugerenciasreportes', 'ver')
  getOne(@Param('id', NumericParamPipe) id: number) {
    return this.quejasService.getOne(id);
  }

  @Public()
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'Adjunto', maxCount: 10 },
  ]))
  create(
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true, forbidUnknownValues: false })) body: CreateQuejaDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
    return this.quejasService.create(body, files);
  }

  @Patch(':id/estado')
  @RequierePermisos('quejasugerenciasreportes', 'editar')
  updateEstado(@Param('id', NumericParamPipe) id: number, 
  @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: UpdateQuejaEstadoDto,
  @Request() req: any
) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.quejasService.updateEstado(id, body.Id_Estado_Queja as number, idUsuario);
  }

  @Patch(':id/responder')
  @RequierePermisos('quejasugerenciasreportes', 'editar')
  responder(
    @Param('id', NumericParamPipe) id: number,
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: ResponderQuejaDto,
    @Request() req: any,
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.quejasService.responderQueja(id, body, idUsuario);
  }

}