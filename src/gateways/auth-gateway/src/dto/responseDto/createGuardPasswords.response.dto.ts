import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateGuardPasswordsResponseDto {
  @ApiProperty({
    description: 'Generated passwords',
    type: [String],
  })
  @IsArray({ message: 'Passwords must be an array' })
  @IsString({
    each: true,
    message: 'Each password must be a string',
  })
  @Expose()
  passwords: string[];

  constructor(partial: Partial<CreateGuardPasswordsResponseDto>) {
    Object.assign(this, partial);
  }
}
