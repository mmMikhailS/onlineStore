import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class GuardAccountServiceDto {
  @ApiProperty({ description: " it's user id" })
  @IsNumber({}, { message: 'user id is not a  number' })
  userId: number;

  @ApiProperty({ description: " it's GuardPass" })
  @IsString({ message: 'double guard password is not a  string' })
  oneTimePass?: string;

  @ApiProperty({ description: " it's google code 2fa" })
  @IsString({ message: 'Google code 2fa  is not a  string' })
  GoogleCode2fa?: string;

  @ApiProperty({ description: " it's double guard type" })
  @IsString({ message: 'double guard type is not a  string' })
  doubleGuardType?: string;
}
