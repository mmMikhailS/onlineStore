import { IsArray, IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllProductsResponseDto {
  @ApiProperty({ description: 'products array' })
  @IsArray({ message: 'products must be an array' })
  products: ProductDto[];
}

class ProductDto {
  @ApiProperty({ description: 'Unique identifier of the product' })
  @IsNumber({}, { message: 'ID must be a string' })
  id: number;

  @ApiProperty({ description: 'Name of the product' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ description: 'Type or category of the product' })
  @IsString({ message: 'Type must be a string' })
  type: string;

  @ApiProperty({ description: 'Description of the product' })
  @IsString({ message: 'Description must be a string' })
  description: string;

  @ApiProperty({ description: 'in stock of the product in stock' })
  @IsNumber({}, { message: 'in stock must be a number' })
  inStock: number;

  @ApiProperty({ description: 'Price or amount of the product' })
  @IsString({ message: 'Amount must be a number' })
  amount: string;

  @ApiProperty({ description: 'Creation date of the product' })
  @IsDateString({}, { message: 'CreatedAt must be a valid ISO date string' })
  createdAt: Date;
}
