import { User } from '../entities/user.entity';

/**
 * Puerto: Interfaz del repositorio de usuarios.
 *
 * El dominio define QUÉ se necesita; la infraestructura define CÓMO se hace.
 * Esto invierte la dependencia (DIP) y permite cambiar Prisma por otro ORM
 * sin tocar el dominio ni los casos de uso.
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  findAll(params?: { skip?: number; take?: number }): Promise<User[]>;
  count(): Promise<number>;
}
