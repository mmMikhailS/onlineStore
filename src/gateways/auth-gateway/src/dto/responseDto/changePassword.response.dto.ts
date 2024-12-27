import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class ChangePasswordResponseDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber({}, { message: 'ID must be a valid number' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'is admin user' })
  @IsBoolean({ message: 'is admin must be a boolean' })
  @Expose()
  isAdmin: boolean;

  @ApiProperty({ description: 'full name token' })
  @IsString({ message: 'full name must be a string' })
  @Expose()
  fullName: string;

  constructor(partial: Partial<ChangePasswordResponseDto>) {
    Object.assign(this, partial);
  }
}
