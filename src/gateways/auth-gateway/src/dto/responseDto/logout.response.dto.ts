import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class LogoutResponseDto {
  @ApiProperty({ description: "it's a user's  id" })
  @IsNumber({}, { message: ' id is not a  string' })
  id: number;

  constructor(partial: Partial<LogoutResponseDto>) {
    Object.assign(this, partial);
  }
}
