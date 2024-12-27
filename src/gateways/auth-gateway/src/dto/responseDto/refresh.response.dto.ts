import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class RefreshTokensResponseDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber({}, { message: 'ID must be a valid number' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'New refresh token' })
  @IsString({ message: 'Refresh token must be a string' })
  @IsOptional()
  @Exclude()
  refreshToken?: string;

  constructor(partial: Partial<RefreshTokensResponseDto>) {
    Object.assign(this, partial);
  }
}
