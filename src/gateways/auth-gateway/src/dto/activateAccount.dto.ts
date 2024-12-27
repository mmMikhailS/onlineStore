import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class activateAccountDto {
  @ApiProperty({ description: " it's code" })
  @IsString({ message: 'code is not a  string' })
  @IsEmail({}, { message: 'code is not email' })
  code: string;

  @ApiProperty({ description: " it's link" })
  @IsString({ message: 'link is not a  string' })
  link: string;

  @ApiProperty({ description: " it's refreshToken" })
  @IsString({ message: 'refreshToken is not a  string' })
  refreshToken: string;
}
