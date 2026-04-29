import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como público (no requiere JWT).
 * Útil para login, registro, productos públicos, etc.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
