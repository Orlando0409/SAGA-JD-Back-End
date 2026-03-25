export type FacturaInput = {
	numeroMedidor: number;
	identificacion: string;
	nombreCliente: string;
	consumoM3: number;
	costoPorM3: number;
	cargoFijo: number;
	totalPagar: number;
	tipoTarifa: string;
	fechaEmision: Date;
	historialLecturas: unknown[];
};

export function FacturaPDF(inputs: FacturaInput[], logo: string | null): string {
	const sections = inputs.map((input, index) => {
		const fecha = input.fechaEmision.toLocaleDateString('es-CR');
		const vencimiento = new Date(input.fechaEmision);
		vencimiento.setDate(vencimiento.getDate() + 15);
		const fechaVenc = vencimiento.toLocaleDateString('es-CR');
		const pageBreakClass = index < inputs.length - 1 ? 'page-break' : '';
		const montoConsumo = input.costoPorM3 > 0 ? input.costoPorM3 * input.consumoM3 : input.totalPagar - input.cargoFijo;
		const consumosRows = buildConsumoRows(input.historialLecturas);
		const montoConsumoFinal = Math.max(montoConsumo, 0);
		const facturaNumero = `${input.numeroMedidor}${String(input.fechaEmision.getTime()).slice(-4)}`;
		const fechaImpresion = new Date().toLocaleString('es-CR');

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
					<div class="org-sub">Facturacion de Servicios</div>
				</div>
				<div class="meta">
					<div><strong>Emision:</strong> ${fecha}</div>
					<div><strong>Vencimiento:</strong> ${fechaVenc}</div>
					<div><strong>Medidor:</strong> ${input.numeroMedidor}</div>
					<div><strong>Estado:</strong> PENDIENTE</div>
				</div>
			</div>

			<div class="status-bar">
				<div><strong>RESUMEN DE CONSUMO</strong></div>
				<div><strong>ESTADO:</strong> PENDIENTE</div>
				<div><strong>FECHA DE IMPRESION:</strong> ${fechaImpresion}</div>
			</div>

			<div class="title-bar">FACTURA N ${facturaNumero}</div>

			<div class="info-grid two-col">
				<div class="cell"><span>NIS o Abonado:</span><strong>${input.numeroMedidor}</strong></div>
				<div class="cell"><span>Cliente:</span><strong>${escapeHtml(input.nombreCliente)}</strong></div>
				<div class="cell"><span>Identificacion:</span><strong>${escapeHtml(input.identificacion)}</strong></div>
				<div class="cell"><span>Tarifa:</span><strong>${escapeHtml(input.tipoTarifa)}</strong></div>
				<div class="cell"><span>Hidrometro:</span><strong>${input.numeroMedidor}</strong></div>
				<div class="cell"><span>Consumo mts. cub.:</span><strong>${input.consumoM3}</strong></div>
				<div class="cell"><span>Fecha lectura:</span><strong>${fecha}</strong></div>
				<div class="cell"><span>Vencimiento:</span><strong>${fechaVenc}</strong></div>
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
					<td>Servicio de agua potable</td>
					<td class="right">${input.consumoM3} x ${input.costoPorM3.toLocaleString('es-CR')}</td>
					<td class="right">CRC ${montoConsumoFinal.toLocaleString('es-CR')}</td>
				</tr>
				<tr>
					<td>Cargo fijo</td>
					<td class="right">-</td>
					<td class="right">CRC ${input.cargoFijo.toLocaleString('es-CR')}</td>
				</tr>
				<tr>
					<td>Lecturas registradas</td>
					<td class="right">-</td>
					<td class="right">${Array.isArray(input.historialLecturas) ? input.historialLecturas.length : 0}</td>
				</tr>
			</tbody>
		</table>

			<div class="split-row">
				<div class="panel">
					<div class="panel-title">HISTORICO DE CONSUMO</div>
					<table class="small-table">
						<thead>
							<tr>
								<th>MES</th>
								<th>AÑO</th>
								<th class="right">CONSUMO</th>
							</tr>
						</thead>
						<tbody>
							${consumosRows}
						</tbody>
					</table>
				</div>
				<div class="panel">
					<div class="panel-title">DESGLOSE DE LA TARIFA</div>
					<table class="small-table">
						<tbody>
							<tr>
								<td>TARIFA ACTUAL</td>
								<td class="right">${escapeHtml(input.tipoTarifa)}</td>
							</tr>
							<tr>
								<td>CARGO FIJO</td>
								<td class="right">CRC ${input.cargoFijo.toLocaleString('es-CR')}</td>
							</tr>
							<tr>
								<td>CONSUMO M3</td>
								<td class="right">${input.consumoM3}</td>
							</tr>
							<tr>
								<td>COSTO POR M3</td>
								<td class="right">CRC ${input.costoPorM3.toLocaleString('es-CR')}</td>
							</tr>
							<tr>
								<td>MONTO CONSUMO</td>
								<td class="right">CRC ${montoConsumoFinal.toLocaleString('es-CR')}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div class="summary">
				<div class="sum-row">
					<span>Subtotal consumo</span>
					<span>CRC ${montoConsumoFinal.toLocaleString('es-CR')}</span>
				</div>
				<div class="sum-row">
					<span>Cargo fijo</span>
					<span>CRC ${input.cargoFijo.toLocaleString('es-CR')}</span>
				</div>
				<div class="sum-row final">
					<span>Total a pagar</span>
					<span>CRC ${input.totalPagar.toLocaleString('es-CR')}</span>
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
	.sheet { border: 1px solid #4b5563; padding: 8px; }
	.top { display: grid; grid-template-columns: 100px 1fr auto; gap: 10px; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #4b5563; }
	.logo-wrap { width: 92px; height: 92px; display: flex; align-items: center; justify-content: center; }
	.logo { width: 88px; height: 88px; object-fit: contain; }
		.logo-placeholder { width: 90px; height: 90px; border: 1px dashed #64748b; display:flex; align-items:center; justify-content:center; font-size: 11px; color:#64748b; }
		.org { text-align: center; }
	.org-title { font-size: 24px; font-weight: 700; }
	.org-sub { font-size: 12px; margin-top: 2px; }
	.meta { font-size: 11px; line-height: 1.45; text-align: right; }
	.status-bar { margin-top: 8px; background: #d1d5db; padding: 4px 8px; font-size: 11px; display: flex; justify-content: space-between; gap: 8px; }
	.title-bar { margin-top: 6px; font-size: 18px; font-weight: 700; text-align: right; }
	.info-grid { margin-top: 8px; border: 1px solid #d1d5db; }
	.info-grid.two-col { display: grid; grid-template-columns: 1fr 1fr; }
	.cell { display: flex; justify-content: space-between; gap: 10px; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; border-right: 1px solid #e5e7eb; }
	.info-grid.two-col .cell:nth-child(2n) { border-right: none; }
	.info-grid.two-col .cell:nth-last-child(-n + 2) { border-bottom: none; }
		.cell span { color: #475569; }
	table { width: 100%; border-collapse: collapse; margin-top: 8px; }
	th { background: #111827; color: #fff; font-size: 11px; padding: 7px; text-align: left; }
	td { border-bottom: 1px solid #e5e7eb; padding: 7px; font-size: 11px; }
		.right { text-align: right; }
	.split-row { margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
	.panel { border: 1px solid #d1d5db; }
	.panel-title { background: #d1d5db; font-weight: 700; font-size: 11px; padding: 5px 7px; }
	.small-table { margin-top: 0; }
	.small-table th { background: #f3f4f6; color: #111827; font-size: 10px; }
	.small-table td { font-size: 10px; }
	.summary { margin-top: 10px; margin-left: auto; width: 340px; border: 1px solid #cbd5e1; }
	.sum-row { display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
	.sum-row.final { background: #111827; color: #fff; font-size: 20px; font-weight: 700; border-bottom: none; }
	.footer-note { margin-top: 8px; text-align: right; font-size: 10px; color: #475569; }
	</style>
</head>
<body>
	${sections.join('')}
</body>
</html>`;
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
			const consumo = Number(row?.Consumo_Calculado_M3 || 0);
			return `<tr><td>${mes}</td><td>${anio}</td><td class="right">${consumo}</td></tr>`;
		})
		.join('');
}

function getMes(m: number): string {
	const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
	return meses[m] || '-';
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
