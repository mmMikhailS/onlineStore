import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyDto {
  @ApiProperty({ description: " it's a user's full name" })
  @IsString({ message: 'full name is not a  string' })
  fullName: string;

  @ApiProperty({ description: " it's a user's email" })
  @IsEmail({}, { message: 'email is not a  string' })
  @IsString({ message: 'email is not a  string' })
  email: string;

  @ApiProperty({ description: " it's a user's refreshToken" })
  @IsEmail({}, { message: 'refreshToken is not a  string' })
  @IsString({ message: 'refreshToken is not a  string' })
  refreshToken: string;

  @ApiProperty({ description: " it's a user's accessToken" })
  @IsEmail({}, { message: 'accessToken is not a  string' })
  @IsString({ message: 'accessToken is not a  string' })
  accessToken: string;
}
