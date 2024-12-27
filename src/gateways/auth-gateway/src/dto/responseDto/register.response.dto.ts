import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class RegisterResponseDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString({ message: 'refreshToken must be a string' })
  @Exclude()
  refreshToken?: string;

  @ApiProperty({ description: 'User ID' })
  @IsNumber({}, { message: 'id must be a number' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'full name for the user' })
  @IsString({ message: 'fullName must be a string' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'email for the user' })
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email must be a email' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'activateLink' })
  @IsString({ message: 'activateLink must be a string' })
  @Expose()
  activateLink: string;

  @ApiProperty({ description: 'isActivated' })
  @IsBoolean({ message: 'isActivated must be a string' })
  @Exclude()
  isActivated: false;

  constructor(partial: Partial<RegisterResponseDto>) {
    Object.assign(this, partial);
  }
}
