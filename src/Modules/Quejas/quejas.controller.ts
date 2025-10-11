import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseInterceptors, Patch, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { NumericParamPipe } from 'src/Common/Pipes/numeric-param.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { QuejasService } from './quejas.service';
import { CreateQuejaDto } from './QuejaDTO\'s/CreateQueja.dto';
import { Public } from '../auth/Decorator/Public.decorator';

@Controller('quejas')
export class QuejasController {
  constructor(private readonly quejasService: QuejasService) {}

  @Get()
  async findAll() {
    return this.quejasService.getAll();
  }

  @Get(':id')
  async findOne(@Param('id', NumericParamPipe) id: number) {
    return this.quejasService.getOne(id);
  }

  @Public()
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'Imagen', maxCount: 10 },
    { name: 'Adjunto', maxCount: 10 },
  ]))
  async create(@Body(new ValidationPipe({ whitelist: true, transform: true })) dto: CreateQuejaDto, @UploadedFiles() files: any) {
    return this.quejasService.create(dto, files);
  }

  @Put(':id')
  putNotAllowed(@Param('id', NumericParamPipe) id: number, @Res() res: Response) {
    const message = `PUT no permitido. Use PATCH /quejas/${id}/estado para actualizar el estado.`;
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ statusCode: 405, error: 'Method Not Allowed', message });
  }

  @Patch(':id/estado')
  async updateEstado(
    @Param('id', NumericParamPipe) id: number,
    @Body() body: any,
  ) {
    const nuevo = body?.Id_Estado_Queja ?? body?.IdEstadoQueja ?? body?.Id_EstadoQueja ?? body?.IdEstado_Queja ?? body?.Id_Estado_Queja;
    return this.quejasService.updateEstado(id, nuevo);
  }

  @Post(':id/responder')
  async responder(@Param('id', NumericParamPipe) id: number, @Body() body: any) {
    const respuesta = body?.Respuesta ?? body?.respuesta;
    return this.quejasService.responderQueja(id, respuesta);
  }

  @Delete(':id')
  async remove(@Param('id', NumericParamPipe) id: number) {
    return this.quejasService.remove(id);
  }
}
