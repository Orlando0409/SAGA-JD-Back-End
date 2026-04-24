import { Controller, Get } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { ApiProperty } from '@nestjs/swagger';

@Controller('facturas')
export class FacturaController {
    constructor (
        private readonly facturaService: FacturaService
    ) { }

    @Get('/all')
    @ApiProperty({ description: 'Endpoint de prueba para verificar que el módulo de facturas está funcionando correctamente.' })
    getAllFacturas() {
        return this.facturaService.getAllFacturas();
    }
}
