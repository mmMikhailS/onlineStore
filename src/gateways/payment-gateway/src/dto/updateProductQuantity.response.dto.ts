import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UpdateProductQuantityResponseDto {
  @ApiProperty({ description: 'The error message' })
  @IsString({ message: 'error message is not a string' })
  @IsOptional()
  @Expose()
  errorMessage?: string;

  @ApiProperty({ description: 'The ID of the product' })
  @IsNumber({}, { message: 'Product ID must be a valid number' })
  @Expose()
  productId: number;

  @ApiProperty({ description: 'The quantity of the product to update' })
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @Expose()
  quantity: number;
}
