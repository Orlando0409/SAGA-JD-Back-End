export function ReporteMail(data: {
  name?: string;
  Papellido?: string;
  Sapellido?: string;
  Correo?: string;
  ubicacion?: string;
  descripcion?: string;
}) {
  const fullName = [data.name, data.Papellido, data.Sapellido].filter(Boolean).join(' ');

  return `
  <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #f4f6f8; padding: 40px; text-align: center;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <div style="margin-bottom: 25px;">
        <img  src="cid:logo" alt="Logo ASADA Juan Díaz" 
             style="
               width: 100px; 
               height: 100px; 
               border-radius: 50%; 
               object-fit: cover;
               box-shadow: 0 2px 8px rgba(0,123,255,0.2);
               margin-bottom: 15px;
             " />
        <h1 style="color: #007bff; margin: 0; font-size: 24px; font-weight: bold;">ASADA Juan Díaz</h1>
      </div>

      <h2 style="color: #333333; margin-bottom: 20px;">📩 Confirmación de reporte recibido</h2>

      <p style="color: #555555; font-size: 16px; line-height: 1.5; text-align:left;">
        Hola <strong>${fullName || 'Usuario'}</strong>, hemos recibido tu reporte. A continuación encontrarás un resumen de tu reporte.
      </p>

      <div style="text-align:left; background:#f9fbff; padding:12px; border-radius:8px; border:1px solid #eef6ff;">
        <p style="margin:6px 0"><strong>Correo:</strong> ${data.Correo || 'N/A'}</p>
        <p style="margin:6px 0"><strong>Ubicación:</strong> ${data.ubicacion || 'N/A'}</p>
        <p style="margin:6px 0"><strong>Descripción:</strong><br/>${data.descripcion || 'N/A'}</p>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

      <p style="color: #aaaaaa; font-size: 12px;">ASADA Juan Díaz <br/>© ${new Date().getFullYear()} Todos los derechos reservados.</p>
    </div>
  </div>
  `;
}
