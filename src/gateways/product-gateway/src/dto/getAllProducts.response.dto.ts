import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class GetAllProductsResponseDto {
  @ApiProperty({ description: " it's error message" })
  @IsString({ message: 'error message is not a  string' })
  @IsOptional()
  @Expose()
  errorMessage?: string;

  @ApiProperty({ description: 'products array' })
  @IsArray({ message: 'products must be an array' })
  @Type((): typeof ProductDto => ProductDto)
  @Expose()
  products: ProductDto[];
}

class ProductDto {
  @ApiProperty({ description: 'Unique identifier of the product' })
  @IsNumber({}, { message: 'ID must be a string' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Creation date of the product' })
  @IsDateString({}, { message: 'CreatedAt must be a valid ISO date string' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Name of the product' })
  @IsString({ message: 'Name must be a string' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Description of the product' })
  @IsString({ message: 'Description must be a string' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Type or category of the product' })
  @IsString({ message: 'Type must be a string' })
  @Expose()
  type: string;

  @ApiProperty({ description: 'Quantity of the product in stock' })
  @IsString({ message: 'Quantity must be a number' })
  @Expose()
  quantity: string;

  @ApiProperty({ description: 'Price or amount of the product' })
  @IsString({ message: 'Amount must be a number' })
  @Expose()
  amount: string;
}
