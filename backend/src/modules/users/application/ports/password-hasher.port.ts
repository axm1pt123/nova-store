/**
 * Puerto: Servicio de hash de contraseñas.
 *
 * El dominio define la abstracción.
 * La implementación (bcrypt, argon2, etc.) vive en infraestructura.
 */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hash: string): Promise<boolean>;
}
