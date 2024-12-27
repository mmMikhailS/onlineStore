import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginGuardResponseDto {
  @ApiProperty({ description: " it's id" })
  @IsNumber({}, { message: 'id is not a number' })
  @Expose()
  id: number;

  @ApiProperty({ description: " it's guardAccess" })
  @IsString({ message: 'guard access is not a  string' })
  @Expose()
  guardAccess: string;

  constructor(partial: Partial<LoginGuardResponseDto>) {
    Object.assign(this, partial);
  }
}
