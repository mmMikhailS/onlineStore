import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateProductResponseDto {
  @ApiProperty({ description: " it's error message" })
  @IsString({ message: 'error message is not a  string' })
  @IsOptional()
  @Expose()
  errorMessage?: string;

  @ApiProperty({ description: " it's product name" })
  @IsString({ message: 'name is not a  string' })
  @Expose()
  name: string;

  @ApiProperty({ description: " it's product type" })
  @IsDate({ message: 'create at is not a  string' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: " it's product description" })
  @IsString({ message: 'description is not a  string' })
  @Expose()
  description: string;

  @ApiProperty({ description: " it's product type" })
  @IsString({ message: 'type is not a  string' })
  @Expose()
  type: string;

  @ApiProperty({ description: " it's product price" })
  @IsString({ message: 'price name is not a string ' })
  @Expose()
  amount: string;
}
