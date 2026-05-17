import { Module, Global } from '@nestjs/common';
import { PdfExportService } from './pdf-export.service';

/**
 * Módulo global de exportación PDF.
 * Marcado @Global() para que cualquier módulo lo pueda inyectar sin importarlo explícitamente.
 */
@Global()
@Module({
    providers: [PdfExportService],
    exports: [PdfExportService],
})
export class PdfModule {}
