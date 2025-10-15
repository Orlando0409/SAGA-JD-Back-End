export function ReporteMail(data: {
  name?: string;
  Papellido?: string;
  Sapellido?: string;
  Correo?: string;
  ubicacion?: string;
  descripcion?: string;
  adjuntos?: string[]; // URLs
}) {
  const fullName = [data.name, data.Papellido, data.Sapellido].filter(Boolean).join(' ');

  const adjuntosHtml = (data.adjuntos || []).map((url) => {
    // Si el adjunto es una imagen (simple heurística), mostrarla inline
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i.test(url);
    if (isImage) {
      return `<div style="margin-bottom:12px;"><img src="${url}" alt="Adjunto" style="max-width:420px; height:auto; display:block; border-radius:6px;"/></div>`;
    }
    return `<div style="margin-bottom:6px;"><a href="${url}" target="_blank">Ver adjunto</a></div>`;
  }).join('');

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.4">
    <div style="padding:20px;background:#f6f6f6;border-radius:8px;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
        <img src="cid:logo" alt="logo" style="width:72px;height:72px;border-radius:8px;object-fit:cover;"/>
        <div>
          <h2 style="margin:0;font-size:18px;color:#1a1a1a;">Nuevo reporte recibido</h2>
          <div style="color:#666;font-size:13px;">Gracias por reportar. Se ha recibido la siguiente información:</div>
        </div>
      </div>

      <div style="background:#fff;padding:14px;border-radius:8px;border:1px solid #e9e9e9">
        <p style="margin:6px 0"><strong>Nombre:</strong> ${fullName || 'N/A'}</p>
        <p style="margin:6px 0"><strong>Correo:</strong> ${data.Correo || 'N/A'}</p>
        <p style="margin:6px 0"><strong>Ubicación:</strong> ${data.ubicacion || 'N/A'}</p>
        <p style="margin:6px 0"><strong>Descripción:</strong><br/>${data.descripcion || 'N/A'}</p>

        ${adjuntosHtml || ''}
      </div>

      <p style="color:#888;font-size:12px;margin-top:12px">Si no solicitaste este reporte, ignora este mensaje.</p>
    </div>
  </div>`;
}
