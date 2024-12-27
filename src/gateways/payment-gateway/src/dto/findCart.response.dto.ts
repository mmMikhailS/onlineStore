import { IsDate, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class FindCartProductsResponseDto {
  @ApiProperty({ description: 'The error message' })
  @IsString({ message: 'error message is not a string' })
  @IsOptional()
  @Expose()
  errorMessage?: string;

  @ApiProperty({
    description: 'List of items in the cart',
  })
  @Type((): typeof CartItem => CartItem)
  @Expose()
  cartItems: CartItem[];
}

class Product {
  @ApiProperty({ description: 'The name of the product' })
  @IsString({ message: 'Product name must be a valid string' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'The amount of the product' })
  @IsString({ message: 'Amount must be a valid string' })
  @Expose()
  amount: string;

  @ApiProperty({ description: 'The stock availability of the product' })
  @IsInt({ message: 'InStock must be a valid integer' })
  @Expose()
  inStock: number;

  @ApiProperty({ description: 'The description of the product' })
  @IsString({ message: 'Description must be a valid string' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'The type of the product' })
  @IsString({ message: 'Type must be a valid string' })
  @Expose()
  type: string;

  @ApiProperty({ description: 'The image of the product in binary format' })
  @Expose()
  image: Buffer;
}

class CartItem {
  @ApiProperty({ description: 'The unique identifier of the cart item' })
  @IsNumber({}, { message: 'Item ID must be a valid number' })
  @Expose()
  id: number;

  @ApiProperty({ description: "The user's products" })
  @Type((): typeof Product => Product)
  @Expose()
  products: Product;

  @ApiProperty({ description: 'The unique name of the cart item' })
  @IsString({ message: 'Name must be a valid string' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'The date and time when the cart item was created',
  })
  @IsDate({ message: 'Created date must be a valid date' })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the cart item was last updated',
  })
  @IsDate({ message: 'Updated date must be a valid date' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'The quantity of the product in the cart' })
  @IsInt({ message: 'Quantity must be a valid integer' })
  @Expose()
  quantity: number;

  @ApiProperty({
    description: 'The unique identifier of the product in the cart',
    nullable: true,
  })
  @IsNumber({}, { message: 'Product ID must be a valid number' })
  @IsOptional()
  @Expose()
  productId: number;

  @ApiProperty({
    description: 'The unique identifier of the cart',
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Cart ID must be a valid number' })
  @Expose()
  cartId: number | null;
}
