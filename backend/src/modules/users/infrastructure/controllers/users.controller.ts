import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AuthenticatedUser,
  CurrentUser,
} from '@shared/application/decorators/current-user.decorator';
import { Public } from '@shared/application/decorators/public.decorator';
import { Roles } from '@shared/application/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/application/guards/roles.guard';
import {
  AdminCreateUserDto,
  AuthResponseDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateProfileDto,
  UserResponseDto,
} from '../../application/dtos/user.dtos';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly getProfile: GetUserProfileUseCase,
    private readonly updateProfile: UpdateUserProfileUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    return this.registerUser.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    return this.loginUser.execute(dto);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.getProfile.execute(user.userId);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.updateProfile.execute(user.userId, dto);
  }

  @Roles('ADMIN')
  @Get('admin/list')
  async listAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, address: true, isActive: true, createdAt: true,
      },
    });
    return users.map((u) => ({
      ...u,
      fullName: `${u.firstName} ${u.lastName}`,
    }));
  }

  @Roles('ADMIN')
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  async adminCreate(@Body() dto: AdminCreateUserDto): Promise<UserResponseDto> {
    const registerDto: RegisterUserDto = {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    };
    const user = await this.registerUser.execute(registerDto);
    if (dto.role === 'ADMIN') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
      return { ...user, role: 'ADMIN' };
    }
    return user;
  }
}
