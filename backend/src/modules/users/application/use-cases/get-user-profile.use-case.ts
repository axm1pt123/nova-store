import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { EntityNotFoundException } from '@shared/domain/exceptions/domain.exceptions';
import { UserResponseDto } from '../dtos/user.dtos';
import { UserMapper } from '../dtos/user.mapper';

@Injectable()
export class GetUserProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new EntityNotFoundException('User', userId);
    return UserMapper.toResponseDto(user);
  }
}
