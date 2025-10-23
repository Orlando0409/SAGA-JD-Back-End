export function QuejaMail(data: {
  name?: string;
  Papellido?: string;
  Sapellido?: string;
  Correo?: string;
  descripcion?: string;
}) {
  const fullName = [data.name, data.Papellido, data.Sapellido].filter(Boolean).join(' ');

  return `
  <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #f4f6f8; padding: 40px; text-align: center; display: block; width: 100%; box-sizing: border-box;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: block; box-sizing: border-box;">
      <div style="margin-bottom: 25px; display: block; text-align: center;">
        <img src="cid:logo" alt="Logo ASADA Juan Díaz" 
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

      <h2 style="color: #333333; margin-bottom: 20px; display: block; text-align: center;">Tu queja ha sido recibida</h2>

      <p style="color: #555555; font-size: 16px; line-height: 1.5; text-align: left; display: block; margin: 20px 0;">
        Hola <strong>${fullName || 'Usuario'}</strong>, hemos recibido tu queja exitosamente. Nuestro equipo la revisará y te responderemos pronto.
      </p>

      <div style="text-align: left; background: #f9fbff; padding: 15px; border-radius: 8px; border: 1px solid #eef6ff; margin: 20px auto; display: block; width: calc(100% - 40px); max-width: 500px; box-sizing: border-box;">
        <h3 style="margin: 0 0 10px 0; color: #007bff; display: block; text-align: left;">Resumen de tu queja:</h3>
        <p style="margin: 8px 0; display: block; text-align: left;"><strong>Correo:</strong> ${data.Correo || 'N/A'}</p>
        <p style="margin: 8px 0; display: block; text-align: left;"><strong>Queja:</strong><br/>${data.descripcion || 'N/A'}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0; display: block; width: 100%;" />

      <p style="color: #aaaaaa; font-size: 12px; text-align: center; display: block; margin: 20px 0;">ASADA Juan Díaz <br/>© ${new Date().getFullYear()} Todos los derechos reservados.</p>
    </div>
  </div>
  `;
}