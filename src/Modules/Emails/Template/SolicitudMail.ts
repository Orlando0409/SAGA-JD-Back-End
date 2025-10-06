export function SolicitudCreadaExitosamenteMail(tipoSolicitud: string, nombreApellidos?: string): string {
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

        <h2 style="color: #28a745; margin-bottom: 20px;">Solicitud Recibida</h2>

        ${nombreApellidos ? `<p style="color: #555555; font-size: 16px; margin-bottom: 15px;">
            Estimado(a) <strong>${nombreApellidos}</strong>,
        </p>` : ''}

        <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            ¡Gracias por confiar en nosotros! Su solicitud de <strong style="color: #007bff;">${tipoSolicitud}</strong> 
            ha sido recibida exitosamente.
        </p>

        <div style="
            background-color: ${getEstadoBackgroundColor('pendiente')}; 
            border-left: 4px solid ${getEstadoBorderColor('pendiente')}; 
            padding: 20px; 
            margin: 25px 0;
            border-radius: 5px;
        ">
            <p style="
            color: ${getEstadoTextColor('pendiente')}; 
            font-size: 18px; 
            font-weight: bold; 
            margin: 0 0 10px 0;
            text-transform: uppercase;
            ">
            PENDIENTE
            </p>
            <p style="color: ${getEstadoTextColor('pendiente')}; font-size: 14px; margin: 0;">
            Su solicitud ha sido registrada exitosamente y será revisada próximamente por nuestro equipo especializado.
            </p>
        </div>

        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
            Hemos registrado su solicitud y comenzaremos a procesarla a la brevedad. 
            Le mantendremos informado sobre cualquier actualización del estado de su solicitud.
        </p>

        <p style="color: #999999; font-size: 14px; line-height: 1.5; margin-top: 30px;">
            Si tiene alguna consulta, no dude en contactarnos. <br/>
            Gracias por utilizar nuestros servicios.
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

export function EstadoSolicitudMail(tipoSolicitud: string, estadoSolicitud: string, nombreApellidos?: string): string {
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

        <h2 style="color: #333333; margin-bottom: 20px;">Actualización de Solicitud</h2>

        ${nombreApellidos ? `<p style="color: #555555; font-size: 16px; margin-bottom: 15px;">
            Estimado(a) <strong>${nombreApellidos}</strong>,
        </p>` : ''}

        <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Le informamos que su solicitud de <strong style="color: #007bff;">${tipoSolicitud}</strong> 
            ha sido revisada y ahora se encuentra en estado:
        </p>

        <div style="
            background-color: ${getEstadoBackgroundColor(estadoSolicitud)}; 
            border-left: 4px solid ${getEstadoBorderColor(estadoSolicitud)}; 
            padding: 20px; 
            margin: 25px 0;
            border-radius: 5px;
        ">
            <p style="
            color: ${getEstadoTextColor(estadoSolicitud)}; 
            font-size: 18px; 
            font-weight: bold; 
            margin: 0 0 10px 0;
            text-transform: uppercase;
            ">
            ${estadoSolicitud}
            </p>
            <p style="color: ${getEstadoTextColor(estadoSolicitud)}; font-size: 14px; margin: 0;">
            ${getEstadoDescripcionCorta(estadoSolicitud)}
            </p>
        </div>

        <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            ${getEstadoMessage(estadoSolicitud)}
        </p>
        
        <p style="color: #999999; font-size: 14px; line-height: 1.5;">
            Si tiene alguna consulta sobre su solicitud, no dude en contactarnos. <br/>
            Gracias por confiar en nuestros servicios.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #aaaaaa; font-size: 12px; margin: 0;">
            ASADA Juan Díaz <br/>
            © ${new Date().getFullYear()} Todos los derechos reservados.
        </p>

        </div>
    </div>
    `;
}

function getEstadoMessage(estado: string): string {
    switch (estado.toLowerCase()) {
        case 'pendiente':
            return 'Su solicitud ha sido recibida exitosamente y se encuentra en estado pendiente. Será revisada próximamente por nuestro equipo.';
        
        case 'en revisión':
        case 'en revision':
            return 'Su solicitud se encuentra actualmente en proceso de revisión por parte de nuestro equipo. Le notificaremos tan pronto como tengamos una respuesta.';
        
        case 'aprobada':
        case 'aprobado':
            return '¡Excelente noticia! Su solicitud ha sido aprobada. Pronto nos pondremos en contacto con usted para coordinar los siguientes pasos del proceso.';
        
        case 'rechazada':
        case 'rechazado':
            return 'Lamentamos informarle que su solicitud no ha sido aprobada en esta ocasión. Si tiene consultas sobre esta decisión, puede contactarnos directamente.';
        
        default:
            return 'El estado de su solicitud ha sido actualizado. Para más información sobre este cambio, puede contactarnos directamente.';
    }
}

function getEstadoBackgroundColor(estado: string): string {
    switch (estado.toLowerCase()) {
        case 'pendiente':
            return '#e9ecef'; // Gris claro
        
        case 'en revisión':
        case 'en revision':
            return '#ffeaa7'; // Naranja claro
        
        case 'aprobada':
        case 'aprobado':
            return '#d4edda'; // Verde claro
        
        case 'rechazada':
        case 'rechazado':
            return '#f8d7da'; // Rojo claro
        
        default:
            return '#f8f9fa'; // Gris claro por defecto
    }
}

function getEstadoBorderColor(estado: string): string {
    switch (estado.toLowerCase()) {
        case 'pendiente':
            return '#6c757d'; // Gris
        
        case 'en revisión':
        case 'en revision':
            return '#fd7e14'; // Naranja
        
        case 'aprobada':
        case 'aprobado':
            return '#28a745'; // Verde
        
        case 'rechazada':
        case 'rechazado':
            return '#dc3545'; // Rojo
        
        default:
            return '#007bff'; // Azul por defecto
    }
}

function getEstadoTextColor(estado: string): string {
    switch (estado.toLowerCase()) {
        case 'pendiente':
            return '#495057'; // Gris oscuro
        
        case 'en revisión':
        case 'en revision':
            return '#fd7e14'; // Naranja
        
        case 'aprobada':
        case 'aprobado':
            return '#155724'; // Verde oscuro
        
        case 'rechazada':
        case 'rechazado':
            return '#721c24'; // Rojo oscuro
        
        default:
            return '#007bff'; // Azul por defecto
    }
}

function getEstadoDescripcionCorta(estado: string): string {
    switch (estado.toLowerCase()) {
        case 'pendiente':
            return 'Su solicitud ha sido registrada y será procesada próximamente.';
        
        case 'en revisión':
        case 'en revision':
            return 'Nuestro equipo está evaluando su solicitud en este momento.';
        
        case 'aprobada':
        case 'aprobado':
            return 'Su solicitud ha sido aprobada exitosamente.';
        
        case 'rechazada':
        case 'rechazado':
            return 'Su solicitud no pudo ser aprobada en esta ocasión.';
        
        default:
            return 'El estado de su solicitud ha sido actualizado.';
    }
}
