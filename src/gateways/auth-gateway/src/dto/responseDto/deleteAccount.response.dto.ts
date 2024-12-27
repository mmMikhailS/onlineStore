import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class DeleteAccountResponseDto {
  @ApiProperty({ description: 'email for the user' })
  @IsString({ message: 'email must be a string' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'full name for the user' })
  @IsString({ message: 'full name must be a string' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'is admin  user' })
  @IsBoolean({ message: 'is admin must be a boolean' })
  @Expose()
  isAdmin: boolean;

  constructor(partial: Partial<DeleteAccountResponseDto>) {
    Object.assign(this, partial);
  }
}
