import { Body, Controller, Delete, Get, Param, Post, UploadedFiles, UseInterceptors, Patch, BadRequestException } from '@nestjs/common';
import { NumericParamPipe } from 'src/Common/Pipes/numeric-param.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { QuejasService } from './quejas.service';
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateQuejaDto } from './Dto/CreateQueja.dto';
import { ResponderQuejaDto } from './Dto/ResponderQueja.dto';
import { UpdateQuejaEstadoDto } from './Dto/UpdateQuejaEstado.dto';

@Controller('quejas')
export class QuejasController {
  constructor(private readonly quejasService: QuejasService) {}

  @Get()
  getAll() {
    return this.quejasService.getAll();
  }

  @Get(':id')
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
  updateEstado(@Param('id', NumericParamPipe) id: number, @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: UpdateQuejaEstadoDto) {
    const nuevo = (body as any)?.Id_Estado_Queja ?? (body as any)?.IdEstadoQueja ?? (body as any)?.Id_EstadoQueja;
    return this.quejasService.updateEstado(id, nuevo as number);
  }

  @Post(':id/responder')
  responder(
    @Param('id', NumericParamPipe) id: number,
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: ResponderQuejaDto,
  ) {
    return this.quejasService.responderQueja(id, body);
  }

  @Delete(':id')
  remove(@Param('id', NumericParamPipe) id: number) {
    return this.quejasService.remove(id);
  }
}