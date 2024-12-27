import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PushedProductsResponseDto {
  @ApiProperty({ description: 'The error message' })
  @IsString({ message: 'error message is not a string' })
  @Expose()
  errorMessage: string;

  @ApiProperty({ description: 'The quantity of the product in the cart' })
  @IsNumber({}, { message: 'Quantity must be a valid integer' })
  @Expose()
  quantity: number;

  @ApiProperty({ description: 'The unique identifier of the product' })
  @IsNumber({}, { message: 'Product ID must be a valid number' })
  @Expose()
  productId: number;

  @ApiProperty({ description: 'The unique identifier of the cart' })
  @IsNumber({}, { message: 'Cart ID must be a valid number' })
  @Expose()
  cartId: number;
}
