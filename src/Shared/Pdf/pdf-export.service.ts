import { BadRequestException, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Response } from 'express';
import * as puppeteer from 'puppeteer';
import type { Browser, PDFOptions } from 'puppeteer';

/**
 * Servicio genérico de exportación a PDF vía Puppeteer.
 * Maneja browser pool, retry en TargetCloseError y health check.
 *
 * Uso:
 *   - generarPdfDesdeHtml(html, options?) → Buffer
 *   - streamPdfToResponse(html, filename, res, options?) → escribe directo a Response
 *
 * Diseñado para ser importado por cualquier módulo (Facturas, Proveedores, Afiliados, etc.)
 * vía PdfModule.
 */
@Injectable()
export class PdfExportService implements OnApplicationShutdown {
    private browser: Browser | null = null;

    // Control de concurrencia para evitar sobrecarga de Puppeteer
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
        if (this.browser && this.browser.connected) {
            return this.browser;
        }

        if (this.browser) {
            await this.browser.close().catch(() => {});
            this.browser = null;
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        });

        browser.on('disconnected', () => {
            if (this.browser === browser) {
                this.browser = null;
            }
        });

        this.browser = browser;
        return browser;
    }

    /**
     * Genera PDF desde HTML. Retry único en TargetCloseError (browser zombie).
     */
    async generarPdfDesdeHtml(html: string, options?: PDFOptions): Promise<Buffer> {
        if (!html || !html.trim()) {
            throw new BadRequestException('HTML vacío — no se puede generar PDF');
        }

        return this.runLimited(async () => {
            const generar = async (): Promise<Buffer> => {
                const browser = await this.getBrowser();
                const page = await browser.newPage();
                try {
                    await page.setContent(html, {
                        waitUntil: 'domcontentloaded',
                        timeout: 30000,
                    });

                    return Buffer.from(await page.pdf({
                        format: 'A4',
                        printBackground: true,
                        margin: {
                            top: '20px',
                            right: '20px',
                            bottom: '20px',
                            left: '20px',
                        },
                        ...options,
                    }));
                } finally {
                    await page.close().catch(() => {});
                }
            };

            try {
                return await generar();
            } catch (err: any) {
                const isTargetClosed = err?.name === 'TargetCloseError'
                    || /Target closed|Protocol error/i.test(err?.message ?? '');
                if (!isTargetClosed) throw err;

                if (this.browser) {
                    await this.browser.close().catch(() => {});
                    this.browser = null;
                }
                return generar();
            }
        });
    }

    /**
     * Genera PDF y lo envía como descarga via Response.
     * Setea Content-Type, Content-Disposition y Content-Length.
     */
    async streamPdfToResponse(
        html: string,
        filename: string,
        res: Response,
        options?: PDFOptions,
    ): Promise<void> {
        const pdfBuffer = await this.generarPdfDesdeHtml(html, options);

        const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeFilename}"`,
            'Content-Length': String(pdfBuffer.length),
        });
        res.send(pdfBuffer);
    }

    async onApplicationShutdown(): Promise<void> {
        if (this.browser) {
            await this.browser.close().catch(() => {});
            this.browser = null;
        }
    }
}
