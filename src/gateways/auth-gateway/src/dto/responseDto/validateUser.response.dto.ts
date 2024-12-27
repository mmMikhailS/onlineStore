import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class ValidateUserResponseDto {
  @ApiProperty({ description: 'Email of the user' })
  @IsString({ message: 'Email must be a valid string' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Full name of the user' })
  @IsString({ message: 'Full name must be a valid string' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'Refresh token' })
  @IsString({ message: 'Refresh token must be a string' })
  @Exclude()
  refreshToken: string;

  constructor(partial: Partial<ValidateUserResponseDto>) {
    Object.assign(this, partial);
  }
}
