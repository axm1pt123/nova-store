import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserPersistenceMapper } from '../mappers/user.persistence-mapper';

/**
 * Adaptador: implementación concreta del repositorio usando Prisma.
 * Esta es la única clase que conoce a Prisma en el módulo de usuarios.
 */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? UserPersistenceMapper.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? UserPersistenceMapper.toDomain(raw) : null;
  }

  async save(user: User): Promise<void> {
    const data = UserPersistenceMapper.toPersistence(user);
    await this.prisma.user.create({ data });
  }

  async update(user: User): Promise<void> {
    const data = UserPersistenceMapper.toPersistence(user);
    await this.prisma.user.update({ where: { id: user.id }, data });
  }

  async findAll(params: { skip?: number; take?: number } = {}): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(UserPersistenceMapper.toDomain);
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }
}
