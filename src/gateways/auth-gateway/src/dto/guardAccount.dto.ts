import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class guardAccountDto {
  @ApiProperty({ description: " it's GuardPass" })
  @IsString({ message: 'one time password is not a  string' })
  @IsOptional()
  oneTimePass?: string;

  @ApiProperty({ description: " it's code 2fa" })
  @IsString({ message: 'Google  code 2fa  is not a  string' })
  @IsOptional()
  GoogleCode2fa?: string;

  @ApiProperty({ description: " it's double guard type" })
  @IsString({ message: 'double guard type is not a  string' })
  doubleGuardType: 'DoubleGuardPass' | 'authApp';
}
