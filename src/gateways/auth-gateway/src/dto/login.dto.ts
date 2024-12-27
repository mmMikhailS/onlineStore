import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class loginDto {
  @ApiProperty({ description: " it's email" })
  @IsString({ message: 'email is not a  string' })
  @IsEmail({}, { message: 'email is not email' })
  email: string;

  @ApiProperty({ description: " it's password" })
  @IsString({ message: 'password is not a  string' })
  password: string;
}
