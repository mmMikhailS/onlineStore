import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class ActivateAccountResponseDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber({}, { message: 'User ID must be a valid number' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Activation link' })
  @IsString({ message: 'Activation link must be a string' })
  @Expose()
  activationLink: string;

  @ApiProperty({ description: 'Activation status' })
  @IsBoolean({ message: 'Activation status must be a boolean value' })
  @Expose()
  isActivated: boolean;

  constructor(partial: Partial<ActivateAccountResponseDto>) {
    Object.assign(this, partial);
  }
}
