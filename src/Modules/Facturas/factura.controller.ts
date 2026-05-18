import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { FacturaService } from './factura.service';
import { JwtAuthGuard } from '../auth/Guard/JwtGuard';
import { RequierePermisos } from '../auth/Decorator/Permiso.decorator';
import { GetUser } from '../auth/Decorator/GetUser.decorator';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { AnularFacturaDTO } from "./FacturaDTO's/AnularFactura.dto";

@Controller('facturas')
@UseGuards(JwtAuthGuard)
export class FacturaController {
    constructor(
        private readonly facturaService: FacturaService,
    ) { }

    @Get('/all')
    @RequierePermisos('abonados', 'ver')
    @ApiOperation({ summary: 'Lista todas las facturas registradas.' })
    getAllFacturas() {
        return this.facturaService.getAllFacturas();
    }

    @Get('/afiliado/:idAfiliado')
    @RequierePermisos('abonados', 'ver')
    @ApiOperation({ summary: 'Lista las facturas de un afiliado específico.' })
    getFacturaByAfiliado(@Param('idAfiliado', ParseIntPipe) idAfiliado: number) {
        return this.facturaService.getFacturaByAfiliado(idAfiliado);
    }

    @Patch('/:idFactura/pagar')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Marca una factura como Pagada. Operación idempotente.' })
    marcarComoPagada(
        @Param('idFactura', ParseIntPipe) idFactura: number,
        @GetUser() usuario: Usuario,
    ) {
        return this.facturaService.marcarComoPagada(idFactura, usuario.Id_Usuario);
    }

    @Patch('/:idFactura/anular')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Anula una factura. Rechaza facturas Pagadas. Idempotente.' })
    anularFactura(
        @Param('idFactura', ParseIntPipe) idFactura: number,
        @Body() dto: AnularFacturaDTO,
        @GetUser() usuario: Usuario,
    ) {
        return this.facturaService.anularFactura(idFactura, usuario.Id_Usuario, dto?.motivo);
    }

    @Post('/marcar-vencidas')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Forza el chequeo de facturas vencidas (Disponible → Pendiente). Uso administrativo.' })
    marcarVencidas() {
        return this.facturaService.marcarFacturasVencidas(true).then(filas => ({
            mensaje: 'Chequeo de facturas vencidas completado',
            facturas_actualizadas: filas,
        }));
    }
}
