import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type Role = 'ADMIN' | 'CUSTOMER';

/**
 * Decorador para restringir endpoints por rol.
 * Uso: @Roles('ADMIN')
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
