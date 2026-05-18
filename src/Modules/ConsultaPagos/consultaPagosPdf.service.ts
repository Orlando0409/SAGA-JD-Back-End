import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FacturaPDF, type FacturaInput } from './Template/FacturaPDF';
import { PdfExportService } from 'src/Shared/Pdf/pdf-export.service';

@Injectable()
export class ConsultaPagosPdfService {
    private logoDataUri: string | null = null;

    constructor(private readonly pdfExportService: PdfExportService) {}

    async generarFacturasDesdeConsultas(
        inputs: FacturaInput[],
        res: Response,
    ): Promise<void> {
        if (!Array.isArray(inputs) || inputs.length === 0) {
            throw new BadRequestException('No hay datos para generar la factura.');
        }

        inputs.forEach((input) => {
            if (!input.numeroMedidor) {
                throw new BadRequestException('No se pudo determinar el numero de medidor para generar la factura.');
            }
        });

        const html = FacturaPDF(inputs, this.getLogoDataUri());

        const filename = inputs.length === 1
            ? `Factura_${inputs[0].numeroMedidor}_${Date.now()}.pdf`
            : `Facturas_${Date.now()}.pdf`;

        await this.pdfExportService.streamPdfToResponse(html, filename, res);
    }

    private getLogoDataUri(): string | null {
        if (this.logoDataUri) {
            return this.logoDataUri;
        }

        const logoPath = join(
            process.cwd(),
            'src',
            'Modules',
            'Emails',
            'Logo',
            'logo.jpeg'
        );

        if (!existsSync(logoPath)) {
            return null;
        }

        const image = readFileSync(logoPath);
        this.logoDataUri = `data:image/jpeg;base64,${image.toString('base64')}`;

        return this.logoDataUri;
    }
}
