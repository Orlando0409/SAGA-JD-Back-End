import { totalLecturasService } from './totalLecturas.service';
import { Body, Controller, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { LecturaService } from "./lectura.service";
import { CreateLecturaDTO } from "./LecturaDTO'S/CreateLectura.dto";
import { UpdateLecturaDTO } from "./LecturaDTO'S/UpdateLectura.dto";
import { JwtAuthGuard } from "../auth/Guard/JwtGuard";
import { GetUser } from "../auth/Decorator/GetUser.decorator";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiProperty } from "@nestjs/swagger";

@Controller('lecturas')
@UseGuards(JwtAuthGuard)
export class LecturaController {
    constructor(
        private readonly totalLecturasService: totalLecturasService,
        private readonly lecturaService: LecturaService
    ) { }

    @Get('/all')
    @ApiProperty({ description: 'Obtiene todas las lecturas registradas en el sistema.' })
    getAllLecturas() {
        return this.lecturaService.getAllLecturas();
    }

    @Get('/tarifas-lecturas')
    @ApiProperty({ description: 'Obtiene todas las tarifas de lecturas registradas en el sistema.' })
    getAllTarifas() {
        return this.lecturaService.getTarifasLecturas();
    }

    @Get('/usuario/:idUsuario')
    @ApiProperty({ description: 'Obtiene todas las lecturas registradas por un usuario específico.' })
    getLecturasByUsuario(@Param('idUsuario') idUsuario: number) {
        return this.lecturaService.getLecturasByUsuario(idUsuario);
    }

    @Get('/medidor/:idMedidor')
    @ApiProperty({ description: 'Obtiene todas las lecturas registradas por un medidor específico.' })
    getLecturasByMedidor(@Param('idMedidor') idMedidor: number) {
        return this.lecturaService.getLecturasByMedidor(idMedidor);
    }

    @Get('/afiliado/:idAfiliado')
    @ApiProperty({ description: 'Obtiene todas las lecturas registradas por un afiliado específico.' })
    getLecturasByAfiliado(@Param('idAfiliado') idAfiliado: number) {
        return this.lecturaService.getLecturasByAfiliado(idAfiliado);
    }

    @Get('/entre-fechas/:fechaInicio/:fechaFin')
    @ApiProperty({ description: 'Obtiene todas las lecturas registradas entre dos fechas específicas.' })
    getLecturasEntreFechas(
        @Param('fechaInicio') fechaInicio: string,
        @Param('fechaFin') fechaFin: string
    ) {
        return this.lecturaService.getLecturasEntreFechas(fechaInicio, fechaFin);
    }

    @Post('/cargar-csv')
    @ApiProperty({ description: 'Carga un archivo CSV con las lecturas.' })
    @UseInterceptors(FileInterceptor('CSV'))
    async uploadCSV(
        @UploadedFile() CSV: Express.Multer.File,
        @GetUser() usuario: Usuario
    ) {
        return this.lecturaService.importarArchivoCSV(CSV, usuario.Id_Usuario);
    }

    @Post('/create')
    @ApiProperty({ description: 'Crea una nueva lectura.' })
    createLectura(
        @Body() dto: CreateLecturaDTO,
        @GetUser() usuario: Usuario
    ) {
        return this.lecturaService.createLectura(dto, usuario.Id_Usuario);
    }

    @Put('/update/:idLectura')
    @ApiProperty({ description: 'Actualiza una lectura existente.' })
    updateLectura(
        @Body() dto: UpdateLecturaDTO,
        @Param('idLectura') idLectura: number,
        @GetUser() usuario: Usuario
    ) {
        return this.lecturaService.updateLectura(dto, idLectura, usuario.Id_Usuario);
    }

    @Post('Aplicar-sello-calidad')
    @ApiProperty({ description: 'Alterna el estado del sello de calidad en las lecturas (activar/desactivar automáticamente).' })
    aplicarSelloCalidad(
        @GetUser() usuario: Usuario
    ) {
        return this.lecturaService.APlicarSelloALecturas(usuario.Id_Usuario);
    }



    @Post('por-pagar/:idTipoTarifa')
    @ApiProperty({ description: 'Calcula el total a pagar por una lectura específica.' })
    calcularTotalAPagar(
        @Param('consumo') consumo: number,
        @Param('idTipoTarifa') idTipoTarifa: number
    ) {
        return this.totalLecturasService.CalcularTotalAPagar(consumo, idTipoTarifa);
    }
}