import { BadRequestException, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Response } from 'express';
import * as puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FacturaPDF, type FacturaInput } from './Template/FacturaPDF';

@Injectable()
export class ConsultaPagosPdfService implements OnApplicationShutdown {
    private browser: Browser | null = null;
    private logoDataUri: string | null = null;

    //  CONTROL DE CONCURRENCIA PARA EVITAR SOBRECARGA DE PUPPETEER
    private activeTasks = 0;
    private queue: (() => void)[] = [];
    private readonly MAX_CONCURRENT = 2;

    private async runLimited<T>(task: () => Promise<T>): Promise<T> {
        if (this.activeTasks >= this.MAX_CONCURRENT) {
            await new Promise<void>((resolve) => this.queue.push(resolve));
        }

        this.activeTasks++;

        try {
            return await task();
        } finally {
            this.activeTasks--;

            const next = this.queue.shift();
            if (next) next();
        }
    }

    private async getBrowser(): Promise<Browser> {
        if (this.browser) {
            return this.browser;
        }

        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process',
                '--no-zygote',
            ],
        });

        return this.browser;
    }

    async generarFacturasDesdeConsultas(
        inputs: FacturaInput[],
        res: Response,
    ): Promise<void> {

        return this.runLimited(async () => {

            if (!Array.isArray(inputs) || inputs.length === 0) {
                throw new BadRequestException('No hay datos para generar la factura.');
            }

            inputs.forEach((input) => {
                if (!input.numeroMedidor) {
                    throw new BadRequestException('No se pudo determinar el numero de medidor para generar la factura.');
                }
            });

            const html = FacturaPDF(inputs, this.getLogoDataUri());
            const browser = await this.getBrowser();

            //  LIMPIEZA PREVENTIVA
            const pages = await browser.pages();
            if (pages.length > 5) {
                await Promise.all(pages.map(p => p.close().catch(() => {})));
            }

            const page = await browser.newPage();

            try {
                await page.setContent(html, {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                });

                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: {
                        top: '20px',
                        right: '20px',
                        bottom: '20px',
                        left: '20px'
                    },
                });

                const filename = inputs.length === 1
                    ? `Factura_${inputs[0].numeroMedidor}_${Date.now()}.pdf`
                    : `Facturas_${Date.now()}.pdf`;

                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Content-Length': String(pdfBuffer.length),
                });

                res.send(pdfBuffer);

            } finally {
                await page.close().catch(() => {});
            }
        });
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

    async onApplicationShutdown(): Promise<void> {
        if (this.browser) {
            await this.browser.close().catch(() => {});
            this.browser = null;
        }
    }
}