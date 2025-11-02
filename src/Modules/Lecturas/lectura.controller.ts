import { Body, Controller, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { LecturaService } from "./lectura.service";
import { CreateLecturaDTO } from "./LecturaDTO'S/CreateLectura.dto";
import { UpdateLecturaDTO } from "./LecturaDTO'S/UpdateLectura.dto";
import { JwtAuthGuard } from "../auth/Guard/JwtGuard";
import { GetUser } from "../auth/Decorator/GetUser.decorator";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { FileInterceptor } from "@nestjs/platform-express";

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

    @Get('/tarifas-lecturas')
    getAllTarifas() {
        return this.lecturaService.getTarifasLecturas();
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

    @Post('/cargar-csv')
    @UseInterceptors(FileInterceptor('CSV'))
    async uploadCSV(
        @UploadedFile() CSV: Express.Multer.File,
        @GetUser() usuario: Usuario
    ) {
        return this.lecturaService.importarArchivoCSV(CSV, usuario.Id_Usuario);
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