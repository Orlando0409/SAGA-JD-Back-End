import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { Request } from 'express';

export const UploadedFileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
) => {
    if (!file) return callback(null, true);

    const allowedExt = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic', '.docx', '.xls', '.xlsx'];
    const ext = extname(file.originalname).toLowerCase();

    if (!allowedExt.includes(ext)) {
        return callback(
            new BadRequestException(`Tipo de archivo no permitido (${ext}). Solo se permiten PDF o imágenes.`),
            false,
        );
    }

    if (file.size > 20 * 1024 * 1024) {
        return callback(
            new BadRequestException('El archivo no debe superar los 20 MB'),
            false,
        );
    }

    callback(null, true);
};