import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface TablaColumna {
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    /** Ancho explícito del column (ej. "120px", "20%"). Si omitido, auto. */
    width?: string;
    /** Max-width inline para forzar wrap. Default global: 200px. */
    maxWidth?: string;
    formatter?: (value: any, row: Record<string, any>) => string;
}

export interface TablaFiltroAplicado {
    label: string;
    value: string;
}

export interface TablaPdfOptions {
    titulo: string;
    subtitulo?: string;
    filtrosAplicados?: TablaFiltroAplicado[];
    columnas: TablaColumna[];
    filas: Record<string, any>[];
    /** Mensaje footer opcional (ej. nota legal, contacto). */
    notaFooter?: string;
    /** Si true incluye logo SAGA-JD (data URI cached). */
    incluirLogo?: boolean;
    /** Override orientación (default portrait). */
    orientacion?: 'portrait' | 'landscape';
}

let logoDataUriCache: string | null | undefined;

function getLogoDataUri(): string | null {
    if (logoDataUriCache !== undefined) return logoDataUriCache;

    const logoPath = join(
        process.cwd(),
        'src',
        'Modules',
        'Emails',
        'Logo',
        'logo.jpeg'
    );

    if (!existsSync(logoPath)) {
        logoDataUriCache = null;
        return null;
    }

    const image = readFileSync(logoPath);
    logoDataUriCache = `data:image/jpeg;base64,${image.toString('base64')}`;
    return logoDataUriCache;
}

function escapeHtml(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function renderCelda(col: TablaColumna, row: Record<string, any>): string {
    const raw = row[col.key];
    const formatted = col.formatter ? col.formatter(raw, row) : raw;
    const align = col.align ?? 'left';
    const style = col.maxWidth ? ` style="max-width:${col.maxWidth}"` : '';
    return `<td class="align-${align}"${style}>${escapeHtml(formatted)}</td>`;
}

function renderHeaderCelda(col: TablaColumna): string {
    const align = col.align ?? 'left';
    const styleParts: string[] = [];
    if (col.width) styleParts.push(`width:${col.width}`);
    if (col.maxWidth) styleParts.push(`max-width:${col.maxWidth}`);
    const style = styleParts.length ? ` style="${styleParts.join(';')}"` : '';
    return `<th class="align-${align}"${style}>${escapeHtml(col.label)}</th>`;
}

export function TablaGenericaPDF(opts: TablaPdfOptions): string {
    const logo = opts.incluirLogo !== false ? getLogoDataUri() : null;
    const fechaImpresion = new Date().toLocaleString('es-CR');
    const totalFilas = opts.filas.length;

    const filtrosHtml = opts.filtrosAplicados && opts.filtrosAplicados.length > 0
        ? `
        <div class="filtros">
            <strong>Filtros aplicados:</strong>
            ${opts.filtrosAplicados.map(f =>
                `<span class="chip"><em>${escapeHtml(f.label)}:</em> ${escapeHtml(f.value)}</span>`
            ).join(' ')}
        </div>`
        : '';

    const theadHtml = `
        <thead>
            <tr>
                ${opts.columnas.map(c => renderHeaderCelda(c)).join('')}
            </tr>
        </thead>`;

    const tbodyHtml = totalFilas === 0
        ? `<tbody><tr><td colspan="${opts.columnas.length}" class="empty">Sin resultados</td></tr></tbody>`
        : `<tbody>${opts.filas.map(row =>
            `<tr>${opts.columnas.map(c => renderCelda(c, row)).join('')}</tr>`
        ).join('')}</tbody>`;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <style>
    @page { size: A4 ${opts.orientacion === 'landscape' ? 'landscape' : 'portrait'}; }
    body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 14px; }
    .top { display: grid; grid-template-columns: 90px 1fr auto; gap: 12px; align-items: center; padding-bottom: 10px; border-bottom: 2px solid #1e3a8a; }
    .logo-wrap { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
    .logo { width: 76px; height: 76px; object-fit: contain; }
    .logo-placeholder { width: 78px; height: 78px; border: 1px dashed #64748b; display:flex; align-items:center; justify-content:center; font-size: 10px; color:#64748b; }
    .org-title { font-size: 22px; font-weight: 700; color: #1e3a8a; }
    .org-sub { font-size: 11px; color: #475569; margin-top: 2px; }
    .meta { font-size: 10px; line-height: 1.5; text-align: right; color: #475569; }
    .titulo { margin-top: 12px; font-size: 18px; font-weight: 700; color: #111827; }
    .subtitulo { font-size: 12px; color: #475569; margin-top: 2px; }
    .filtros { margin-top: 8px; padding: 6px 10px; background: #f1f5f9; border-left: 3px solid #1e3a8a; font-size: 10px; color: #334155; }
    .chip { display: inline-block; margin-right: 8px; padding: 2px 6px; background: #e2e8f0; border-radius: 8px; font-size: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; table-layout: auto; }
    th { background: #1e3a8a; color: #fff; font-size: 10px; padding: 7px 6px; text-align: left; text-transform: uppercase; letter-spacing: 0.3px; word-break: break-word; overflow-wrap: anywhere; }
    td { border-bottom: 1px solid #e5e7eb; padding: 6px; font-size: 10px; color: #334155; word-break: break-word; overflow-wrap: anywhere; vertical-align: top; max-width: 200px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .align-left { text-align: left; }
    .align-right { text-align: right; }
    .align-center { text-align: center; }
    .empty { text-align: center; color: #94a3b8; padding: 18px; font-style: italic; }
    .resumen { margin-top: 12px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px; display: flex; justify-content: space-between; }
    .nota { margin-top: 10px; font-size: 9px; color: #64748b; font-style: italic; }
    </style>
</head>
<body>
    <div class="top">
        <div class="logo-wrap">
            ${logo ? `<img src="${logo}" class="logo" alt="Logo" />` : '<div class="logo-placeholder">LOGO</div>'}
        </div>
        <div>
            <div class="org-title">SAGA-JD</div>
            <div class="org-sub">Sistema de Agua Potable de la ASADA de Juan Díaz</div>
        </div>
        <div class="meta">
            <div><strong>Generado:</strong> ${fechaImpresion}</div>
            <div><strong>Total registros:</strong> ${totalFilas}</div>
        </div>
    </div>

    <div class="titulo">${escapeHtml(opts.titulo)}</div>
    ${opts.subtitulo ? `<div class="subtitulo">${escapeHtml(opts.subtitulo)}</div>` : ''}

    ${filtrosHtml}

    <table>
        ${theadHtml}
        ${tbodyHtml}
    </table>

    <div class="resumen">
        <span><strong>Total de registros:</strong> ${totalFilas}</span>
        <span><strong>Generado:</strong> ${fechaImpresion}</span>
    </div>

    ${opts.notaFooter ? `<div class="nota">${escapeHtml(opts.notaFooter)}</div>` : ''}
</body>
</html>`;
}
