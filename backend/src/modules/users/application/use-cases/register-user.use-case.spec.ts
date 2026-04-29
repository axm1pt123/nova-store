import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../ports/password-hasher.port';
import { User } from '../../domain/entities/user.entity';
import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';

/**
 * Test unitario del caso de uso.
 * No usa Prisma ni NestJS: sólo los puertos del dominio con mocks.
 * Esta es la ventaja real de Clean Architecture: tests rápidos y aislados.
 */
describe('RegisterUserUseCase', () => {
  let userRepo: jest.Mocked<UserRepository>;
  let hasher: jest.Mocked<PasswordHasher>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
    };
    hasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn(),
    };
    useCase = new RegisterUserUseCase(userRepo, hasher);
  });

  it('registers a new user with hashed password', async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({
      email: 'new@user.com',
      password: 'StrongPass123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(hasher.hash).toHaveBeenCalledWith('StrongPass123');
    expect(userRepo.save).toHaveBeenCalledWith(expect.any(User));
    expect(result.email).toBe('new@user.com');
    expect(result.role).toBe('CUSTOMER');
  });

  it('rejects registration if email already exists', async () => {
    userRepo.findByEmail.mockResolvedValue({} as User);

    await expect(
      useCase.execute({
        email: 'existing@user.com',
        password: 'StrongPass123',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    ).rejects.toThrow(BusinessRuleViolationException);

    expect(userRepo.save).not.toHaveBeenCalled();
  });
});
