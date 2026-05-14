export type FacturaInput = {
	numeroMedidor: number;
	identificacion: string;
	nombreCliente: string;
	tipoTarifa: string;
	fechaEmision: Date;
	fechaVencimiento: Date;
	fechaLectura: Date;
	historialLecturas: unknown[];
	// Datos directos de la factura
	consumoM3: number;
	costoPromedioPorM3: number;
	cargoFijo: number;
	cargoConsumo: number;
	cargoRecursoHidrico: number;
	otrosCargos: number;
	subtotal: number;
	impuestos: number;
	totalPagar: number;
	estadoFactura: string;
	numeroFactura: string;
};

export function FacturaPDF(inputs: FacturaInput[], logo: string | null): string {
	const sections = inputs.map((input, index) => {
		const fechaVenc = input.fechaVencimiento.toLocaleDateString('es-CR');
		const fechaLect = input.fechaLectura.toLocaleDateString('es-CR');
		const pageBreakClass = index < inputs.length - 1 ? 'page-break' : '';
		const consumosRows = buildConsumoRows(input.historialLecturas);
		const fechaImpresion = new Date().toLocaleString('es-CR');
		const consumoFmt = formatM3(input.consumoM3);

		return `
	<section class="factura ${pageBreakClass}">
		<div class="sheet">
			<div class="top">
				<div class="logo-wrap">
					${logo ? `<img src="${logo}" class="logo" alt="Logo" />` : '<div class="logo-placeholder">LOGO</div>'}
				</div>
				<div class="org">
					<div class="org-title">SAGA-JD</div>
					<div class="org-sub">Sistema de Agua Potable de la ASADA de Juan Díaz</div>
					<div class="org-sub">Facturación de Servicios</div>
				</div>
				<div class="meta">
					<div><strong>Factura N°:</strong> ${escapeHtml(input.numeroFactura)}</div>
					<div><strong>Estado:</strong> ${escapeHtml(input.estadoFactura)}</div>
					<div><strong>Vencimiento:</strong> ${fechaVenc}</div>
					<div class="impresion">Impreso: ${fechaImpresion}</div>
				</div>
			</div>

			<div class="info-grid two-col">
				<div class="cell"><span>Cliente:</span><strong>${escapeHtml(input.nombreCliente)}</strong></div>
				<div class="cell"><span>Identificación:</span><strong>${escapeHtml(input.identificacion)}</strong></div>
				<div class="cell"><span>Medidor:</span><strong>${input.numeroMedidor}</strong></div>
				<div class="cell"><span>Tarifa:</span><strong>${escapeHtml(input.tipoTarifa)}</strong></div>
				<div class="cell"><span>Fecha lectura:</span><strong>${fechaLect}</strong></div>
				<div class="cell"><span>Consumo:</span><strong>${consumoFmt} m³</strong></div>
			</div>

			<table class="main-table">
				<thead>
					<tr>
						<th>Concepto</th>
						<th class="right">Detalle</th>
						<th class="right">Monto</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Cargo fijo</td>
						<td class="right">Tarifa ${escapeHtml(input.tipoTarifa)}</td>
						<td class="right">${money(input.cargoFijo)}</td>
					</tr>
					<tr>
						<td>Servicio de agua potable</td>
						<td class="right">${consumoFmt} m³ (escalonado) · prom. ${money(input.costoPromedioPorM3)}/m³</td>
						<td class="right">${money(input.cargoConsumo)}</td>
					</tr>
					<tr>
						<td>Cargo recurso hídrico</td>
						<td class="right">${consumoFmt} m³</td>
						<td class="right">${money(input.cargoRecursoHidrico)}</td>
					</tr>
					<tr>
						<td>Hidrantes</td>
						<td class="right">${consumoFmt} m³ × ₡26/m³</td>
						<td class="right">${money(input.otrosCargos)}</td>
					</tr>
				</tbody>
			</table>

			<div class="split-row">
				<div class="panel">
					<div class="panel-title">HISTÓRICO DE CONSUMO</div>
					<table class="small-table">
						<thead>
							<tr>
								<th>MES</th>
								<th>AÑO</th>
								<th class="right">CONSUMO (m³)</th>
							</tr>
						</thead>
						<tbody>
							${consumosRows}
						</tbody>
					</table>
				</div>

				<div class="summary">
					<div class="sum-row">
						<span>Subtotal</span>
						<span>${money(input.subtotal)}</span>
					</div>
					<div class="sum-row">
						<span>IVA (13%)</span>
						<span>${money(input.impuestos)}</span>
					</div>
					<div class="sum-row final">
						<span>Total a pagar</span>
						<span>${money(input.totalPagar)}</span>
					</div>
				</div>
			</div>

			<div class="footer-note">Pago antes del vencimiento para evitar recargos.</div>
		</div>
	</section>`;
	});

	return `
<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8" />
	<style>
	body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 10px; }
	.factura { width: 100%; }
	.page-break { page-break-after: always; }
	.sheet { border: 1px solid #4b5563; padding: 10px; }
	.top { display: grid; grid-template-columns: 100px 1fr auto; gap: 10px; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #4b5563; }
	.logo-wrap { width: 92px; height: 92px; display: flex; align-items: center; justify-content: center; }
	.logo { width: 88px; height: 88px; object-fit: contain; }
	.logo-placeholder { width: 90px; height: 90px; border: 1px dashed #64748b; display:flex; align-items:center; justify-content:center; font-size: 11px; color:#64748b; }
	.org { text-align: center; }
	.org-title { font-size: 24px; font-weight: 700; }
	.org-sub { font-size: 12px; margin-top: 2px; }
	.meta { font-size: 11px; line-height: 1.55; text-align: right; }
	.meta .impresion { color: #6b7280; font-size: 10px; margin-top: 4px; }
	.info-grid { margin-top: 10px; border: 1px solid #d1d5db; }
	.info-grid.two-col { display: grid; grid-template-columns: 1fr 1fr; }
	.cell { display: flex; justify-content: space-between; gap: 10px; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; border-right: 1px solid #e5e7eb; }
	.info-grid.two-col .cell:nth-child(2n) { border-right: none; }
	.info-grid.two-col .cell:nth-last-child(-n + 2) { border-bottom: none; }
	.cell span { color: #475569; }
	table { width: 100%; border-collapse: collapse; margin-top: 10px; }
	th { background: #111827; color: #fff; font-size: 11px; padding: 7px; text-align: left; }
	td { border-bottom: 1px solid #e5e7eb; padding: 7px; font-size: 11px; }
	.right { text-align: right; }
	.split-row { margin-top: 10px; display: grid; grid-template-columns: 1fr 340px; gap: 10px; align-items: start; }
	.panel { border: 1px solid #d1d5db; }
	.panel-title { background: #d1d5db; font-weight: 700; font-size: 11px; padding: 5px 7px; }
	.small-table { margin-top: 0; }
	.small-table th { background: #f3f4f6; color: #111827; font-size: 10px; }
	.small-table td { font-size: 10px; }
	.summary { border: 1px solid #cbd5e1; }
	.sum-row { display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
	.sum-row.final { background: #111827; color: #fff; font-size: 18px; font-weight: 700; border-bottom: none; }
	.footer-note { margin-top: 10px; text-align: right; font-size: 10px; color: #475569; }
	</style>
</head>
<body>
	${sections.join('')}
</body>
</html>`;
}

function money(value: number): string {
	const safe = Number.isFinite(value) ? value : 0;
	return `₡${safe.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildConsumoRows(historialLecturas: unknown[]): string {
	if (!Array.isArray(historialLecturas) || historialLecturas.length === 0) {
		return '<tr><td colspan="3" class="right">Sin historial</td></tr>';
	}

	return historialLecturas
		.map((row: any) => {
			const fechaLectura = row?.Fecha_Lectura ? new Date(row.Fecha_Lectura) : null;
			const mes = fechaLectura ? getMes(fechaLectura.getMonth()) : '-';
			const anio = fechaLectura ? fechaLectura.getFullYear() : '-';
			const consumo = formatM3(Number(row?.Consumo_Calculado_M3 || 0));
			return `<tr><td>${mes}</td><td>${anio}</td><td class="right">${consumo}</td></tr>`;
		})
		.join('');
}

function formatM3(value: number): string {
	if (!Number.isFinite(value)) return '0';
	return Number.isInteger(value)
		? String(value)
		: value.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getMes(m: number): string {
	const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
	return meses[m] || '-';
}

function escapeHtml(value: string): string {
	if (!value) return '';
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
