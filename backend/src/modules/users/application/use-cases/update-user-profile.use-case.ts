import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { EntityNotFoundException } from '@shared/domain/exceptions/domain.exceptions';
import { UpdateProfileDto, UserResponseDto } from '../dtos/user.dtos';
import { UserMapper } from '../dtos/user.mapper';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new EntityNotFoundException('User', userId);

    user.updateProfile(dto);
    await this.userRepository.update(user);
    return UserMapper.toResponseDto(user);
  }
}
