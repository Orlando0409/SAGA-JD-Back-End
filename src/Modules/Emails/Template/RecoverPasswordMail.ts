export function RecoverPasswordMail(url: string): string {
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
        <h1 style="color: #007bff; margin: 0; font-size: 24px; font-weight: bold;">
          ASADA Juan Díaz
        </h1>
      </div>
  <h2 style="color: #333333; margin-bottom: 20px;">🔒 Recuperación de contraseña</h2>
      
      <p style="color: #555555; font-size: 16px; line-height: 1.5;">
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
        Haz clic en el siguiente botón para crear una nueva contraseña:
      </p>
      
      <a href="${url}" 
         style="
           display: inline-block; 
           margin: 25px 0;
           padding: 15px 30px;
           font-size: 16px;
           color: #ffffff;
           background-color: #007bff;
           text-decoration: none;
           border-radius: 5px;
           font-weight: bold;
         ">
        Restablecer contraseña
      </a>
      
      <p style="color: #999999; font-size: 14px; line-height: 1.5;">
        Este enlace expirará en 10 minutos. <br/>
        Si no solicitaste este correo, puedes ignorarlo de forma segura.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

      <p style="color: #aaaaaa; font-size: 12px;">
        ASADA Juan Díaz <br/>
        © ${new Date().getFullYear()} Todos los derechos reservados.
      </p>

    </div>
  </div>
  `;
}