import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber({}, { message: 'id must be a number' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'User activation status' })
  @IsBoolean({ message: 'isActivated must be a boolean' })
  @Expose()
  isActivated: boolean;

  @ApiProperty({ description: 'two step  verification' })
  @IsBoolean({ message: 'two step verification must be a boolean' })
  @Expose()
  twoStepVerification: boolean;

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
}
