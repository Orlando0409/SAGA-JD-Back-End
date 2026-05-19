import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface CampoDetalle {
    label: string;
    valor: string | number | null | undefined;
    /** Si true ocupa ancho completo (descripciones largas, observaciones). */
    fullWidth?: boolean;
    /** Si true preserva whitespace (JSON, multiline). */
    monospace?: boolean;
}

export interface SeccionDetalle {
    titulo: string;
    campos: CampoDetalle[];
}

export interface DetalleRegistroPdfOptions {
    /** Título grande del documento. */
    titulo: string;
    /** Subtítulo opcional. */
    subtitulo?: string;
    /** Etiqueta arriba derecha (ej "Proveedor #123"). */
    numeroRegistro?: string;
    /** Estado/badge top-right (ej "Activo"). */
    estado?: string;
    /** Secciones con campos. */
    secciones: SeccionDetalle[];
    /** Nota legal al pie. */
    notaFooter?: string;
    /** Logo? default true */
    incluirLogo?: boolean;
}

let logoDataUriCache: string | null | undefined;

function getLogoDataUri(): string | null {
    if (logoDataUriCache !== undefined) return logoDataUriCache;
    const logoPath = join(process.cwd(), 'src', 'Modules', 'Emails', 'Logo', 'logo.jpeg');
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

function renderCampo(campo: CampoDetalle): string {
    const valor = campo.valor === null || campo.valor === undefined || campo.valor === ''
        ? '—'
        : String(campo.valor);
    const valorClass = campo.monospace ? 'valor monospace' : 'valor';
    const colClass = campo.fullWidth ? 'campo full' : 'campo';
    return `
        <div class="${colClass}">
            <div class="label">${escapeHtml(campo.label)}</div>
            <div class="${valorClass}">${escapeHtml(valor)}</div>
        </div>
    `;
}

function renderSeccion(s: SeccionDetalle): string {
    return `
        <div class="seccion">
            <div class="seccion-titulo">${escapeHtml(s.titulo)}</div>
            <div class="seccion-grid">
                ${s.campos.map(renderCampo).join('')}
            </div>
        </div>
    `;
}

export function DetalleRegistroPDF(opts: DetalleRegistroPdfOptions): string {
    const logo = opts.incluirLogo !== false ? getLogoDataUri() : null;
    const fechaImpresion = new Date().toLocaleString('es-CR');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <style>
    @page { size: A4 portrait; }
    body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 16px; }
    .top { display: grid; grid-template-columns: 90px 1fr auto; gap: 12px; align-items: center; padding-bottom: 10px; border-bottom: 2px solid #1e3a8a; }
    .logo-wrap { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
    .logo { width: 76px; height: 76px; object-fit: contain; }
    .logo-placeholder { width: 78px; height: 78px; border: 1px dashed #64748b; display:flex; align-items:center; justify-content:center; font-size: 10px; color:#64748b; }
    .org-title { font-size: 22px; font-weight: 700; color: #1e3a8a; }
    .org-sub { font-size: 11px; color: #475569; margin-top: 2px; }
    .meta { font-size: 10px; line-height: 1.5; text-align: right; color: #475569; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #dbeafe; color: #1e40af; margin-top: 4px; }
    .titulo { margin-top: 14px; font-size: 20px; font-weight: 700; color: #111827; }
    .subtitulo { font-size: 12px; color: #475569; margin-top: 2px; }
    .seccion { margin-top: 16px; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; page-break-inside: avoid; }
    .seccion-titulo { background: #1e3a8a; color: #fff; padding: 8px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
    .seccion-grid { padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
    .campo { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .campo.full { grid-column: 1 / -1; }
    .label { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; font-weight: 600; }
    .valor { font-size: 12px; color: #111827; word-break: break-word; overflow-wrap: anywhere; }
    .valor.monospace { font-family: 'Courier New', monospace; font-size: 10px; white-space: pre-wrap; background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0; }
    .nota { margin-top: 14px; font-size: 9px; color: #64748b; font-style: italic; text-align: center; }
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
            ${opts.numeroRegistro ? `<div><strong>${escapeHtml(opts.numeroRegistro)}</strong></div>` : ''}
            <div>Generado: ${fechaImpresion}</div>
            ${opts.estado ? `<div class="badge">${escapeHtml(opts.estado)}</div>` : ''}
        </div>
    </div>

    <div class="titulo">${escapeHtml(opts.titulo)}</div>
    ${opts.subtitulo ? `<div class="subtitulo">${escapeHtml(opts.subtitulo)}</div>` : ''}

    ${opts.secciones.map(renderSeccion).join('')}

    ${opts.notaFooter ? `<div class="nota">${escapeHtml(opts.notaFooter)}</div>` : ''}
</body>
</html>`;
}
