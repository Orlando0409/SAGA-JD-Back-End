import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { LecturaService } from "./lectura.service";
import { CreateLecturaDTO } from "./LecturaDTO'S/CreateLectura.dto";
import { UpdateLecturaDTO } from "./LecturaDTO'S/UpdateLectura.dto";

@Controller('lecturas')
export class LecturaController {
    constructor(
        private readonly lecturaService: LecturaService
    ) { }

    @Get('/all')
    getAllLecturas() {
        return this.lecturaService.getAllLecturas();
    }

    @Get('/usuario/:idUsuario')
    getLecturasByUsuario(@Param('idUsuario') idUsuario: number) {
        return this.lecturaService.getLecturasByUsuario(idUsuario);
    }

    @Get('/medidor/:idMedidor')
    getLecturasByMedidor(@Param('idMedidor') idMedidor: number) {
        return this.lecturaService.getLecturasByMedidor(idMedidor);
    }

    @Get('/afiliado/:idAfiliado')
    getLecturasByAfiliado(@Param('idAfiliado') idAfiliado: number) {
        return this.lecturaService.getLecturasByAfiliado(idAfiliado);
    }

    @Get('/entre-fechas/:fechaInicio/:fechaFin')
    getLecturasEntreFechas(
        @Param('fechaInicio') fechaInicio: string,
        @Param('fechaFin') fechaFin: string
    ) {
        return this.lecturaService.getLecturasEntreFechas(fechaInicio, fechaFin);
    }

    @Post('/create/:idUsuario')
    createLectura(
        @Body() dto: CreateLecturaDTO,
        @Param('idUsuario') idUsuario: number
    ) {
        return this.lecturaService.createLectura(dto, idUsuario);
    }

    @Put('/update/:idLectura/:idUsuario')
    updateLectura(
        @Body() dto: UpdateLecturaDTO,
        @Param('idLectura') idLectura: number,
        @Param('idUsuario') idUsuario: number,
    ) {
        return this.lecturaService.updateLectura(dto, idLectura, idUsuario);
    }
}