import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { LecturaService } from "./lectura.service";
import { CreateLecturaDTO } from "./LecturaDTO'S/CreateLectura.dto";
import { UpdateLecturaDTO } from "./LecturaDTO'S/UpdateLectura.dto";
import { JwtAuthGuard } from "../auth/Guard/JwtGuard";
import { GetUser } from "../auth/Decorator/GetUser.decorator";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";

@Controller('lecturas')
@UseGuards(JwtAuthGuard)
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

    @Post('/create')
    createLectura(
        @Body() dto: CreateLecturaDTO,
        @GetUser() usuario: Usuario
    ) {
        return this.lecturaService.createLectura(dto, usuario.Id_Usuario);
    }

    @Put('/update/:idLectura')
    updateLectura(
        @Body() dto: UpdateLecturaDTO,
        @Param('idLectura') idLectura: number,
        @GetUser() usuario: Usuario
    ) {
        return this.lecturaService.updateLectura(dto, idLectura, usuario.Id_Usuario);
    }
}