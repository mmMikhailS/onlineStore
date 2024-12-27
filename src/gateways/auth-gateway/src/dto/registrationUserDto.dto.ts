import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class registrationUserDto {
  @ApiProperty({ description: " it's a user's full name" })
  @IsString({ message: 'email is not a  string' })
  fullName: string;

  @ApiProperty({ description: " it's a user's email" })
  @IsEmail({}, { message: 'email is not a  string' })
  @IsString({ message: 'email is not a  string' })
  email: string;

  @ApiProperty({ description: "it's a user's password" })
  @IsString({ message: 'password is not a  string' })
  @Length(4, 16, { message: 'password has less than 4 or more 16 characters' })
  password: string;

  @ApiProperty({ description: "it's a user's acceptPassword" })
  @IsString({ message: 'acceptPassword is not a  string' })
  @Length(4, 16, { message: 'password has less than 4 or more 16 characters' })
  acceptPassword: string;
}
