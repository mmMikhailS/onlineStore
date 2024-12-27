import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class GuardResponseDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber({}, { message: 'id must be a number' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'User activation status' })
  @IsBoolean({ message: 'isActivated must be a boolean' })
  @IsOptional()
  @Expose()
  isActivated?: boolean;

  @ApiProperty({ description: 'Activation link for the user' })
  @IsString({ message: 'activationLink must be a string' })
  @IsOptional()
  @Expose()
  activationLink?: string;

  @ApiProperty({ description: 'Refresh token' })
  @IsString({ message: 'refreshToken must be a string' })
  @IsOptional()
  @Expose()
  refreshToken?: string;

  constructor(partial: Partial<GuardResponseDto>) {
    Object.assign(this, partial);
  }
}
