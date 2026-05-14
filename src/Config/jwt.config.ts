import { registerAs } from '@nestjs/config';
import type { StringValue } from 'ms';

/**
 * Configuración JWT tipada y validada al arranque.
 *
 * - `secret` y `refreshSecret` se exigen presentes (fail-fast si faltan).
 * - `expiresIn` se castea al tipo exacto que espera `@nestjs/jwt`:
 *   number (segundos) o un literal de `ms` tipo `"60s"`, `"1d"`, `"7d"`, etc.
 *
 * Acceso recomendado vía `ConfigType<typeof jwtConfig>` para conservar la inferencia.
 */
function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === '') {
        throw new Error(`Variable de entorno requerida no definida: ${name}`);
    }
    return value;
}

export type JwtExpiresIn = number | StringValue;

export default registerAs('jwt', () => ({
    secret: requireEnv('JWT_SECRET'),
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as JwtExpiresIn,
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as JwtExpiresIn,
}));
