import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class GenerateGoogle2faResponseDto {
  @ApiProperty({ description: 'Secret code for 2FA' })
  @IsString({ message: 'secret must be a string' })
  @Expose()
  code: string;

  @ApiProperty({ description: 'QR Code as data URL' })
  @IsString({ message: 'QR Code must be a string' })
  @Expose()
  qrCode: string;
}
