import PDFDocument from 'pdfkit';
import axios from 'axios';

// Genera un PDF en memoria con los datos del reporte y una imagen (si existe).
export async function generarReportePDF(opts: {
  fullName?: string;
  correo?: string;
  ubicacion?: string;
  descripcion?: string;
  imagenUrl?: string; // opcional: URL pública de la imagen
}): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: true, margin: 50 });
      const buffers: Uint8Array[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Cabecera
      doc.fontSize(20).fillColor('#007bff').text('ASADA Juan Díaz', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(16).fillColor('#333').text('Reporte recibido', { align: 'center' });
      doc.moveDown(1);

      // Datos
      doc.fontSize(12).fillColor('#000');
      if (opts.fullName) doc.text(`Nombre: ${opts.fullName}`);
      if (opts.correo) doc.text(`Correo: ${opts.correo}`);
      if (opts.ubicacion) doc.text(`Ubicación: ${opts.ubicacion}`);
      doc.moveDown(0.5);
      doc.text('Descripción:');
      doc.fontSize(11).fillColor('#222').text(opts.descripcion || 'N/A', { align: 'left' });

      // Imagen (si existe)
      if (opts.imagenUrl) {
        try {
          const resp = await axios.get(opts.imagenUrl, { responseType: 'arraybuffer' });
          const imgBuffer = Buffer.from(resp.data);
          doc.addPage();
          doc.fontSize(14).text('Imagen adjunta', { align: 'center' });
          doc.moveDown(0.5);
          // Ajustar la imagen al ancho disponible
          const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
          doc.image(imgBuffer, { fit: [pageWidth, 400], align: 'center' });
        } catch (err) {
          // Si la descarga falla, insertar mensaje
          doc.moveDown(1);
          doc.fontSize(12).fillColor('red').text('No fue posible descargar la imagen adjunta.');
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
