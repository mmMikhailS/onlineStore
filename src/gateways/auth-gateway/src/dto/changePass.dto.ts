import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class changePassDto {
  @ApiProperty({ description: " it's email" })
  @IsString({ message: 'email is not a  string' })
  @IsEmail({}, { message: 'email is not email' })
  email: string;

  @ApiProperty({ description: " it's oldPassword" })
  @IsString({ message: 'oldPassword is not a  string' })
  oldPassword: string;

  @ApiProperty({ description: " it's newPassword" })
  @IsString({ message: 'newPassword is not a  string' })
  newPassword: string;

  @ApiProperty({ description: " it's acceptNewPassword" })
  @IsString({ message: 'acceptNewPassword is not a  string' })
  acceptNewPassword: string;
}
