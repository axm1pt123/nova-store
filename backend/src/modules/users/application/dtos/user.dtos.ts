import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'A valid email is required' })
  email!: string;

  @ApiProperty({ example: 'miPassword123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ example: '+591 70000000' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginUserDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'miPassword123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional() @IsString() firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional() @IsString() lastName?: string;

  @ApiPropertyOptional({ example: '+591 70000000' })
  @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional({ example: 'Av. Arce 123, La Paz' })
  @IsOptional() @IsString() address?: string;
}

export class AdminCreateUserDto {
  @ApiProperty({ example: 'admin@ejemplo.com' })
  @IsEmail({}, { message: 'A valid email is required' })
  email!: string;

  @ApiProperty({ example: 'miPassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Ana' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'García' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'CUSTOMER'], example: 'CUSTOMER' })
  @IsOptional()
  @IsString()
  role?: 'ADMIN' | 'CUSTOMER';

  @ApiPropertyOptional({ example: '+591 70000000' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'ADMIN' | 'CUSTOMER';
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
}
