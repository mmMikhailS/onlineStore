import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {
  @ApiProperty({ description: 'Unique identifier for the cart item' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Date when the item was created' })
  @IsString()
  createdAt: string;

  @ApiProperty({ description: 'Date when the item was last updated' })
  @IsString()
  updatedAt: string;

  @ApiProperty({ description: 'Quantity of the product in the cart' })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'ID of the associated product',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  productId: number | null;

  @ApiProperty({
    description: 'ID of the associated cart',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  cartId: number | null;
}

export class PushedProductsWithCartItemsDto {
  @ApiProperty({ description: 'Unique identifier for the pushed product' })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'List of cart items associated with the product',
    type: [CartItemDto],
  })
  @IsArray()
  @Type(() => CartItemDto)
  cartItems: CartItemDto[];
}

export class PushedProductsBasicDto {
  @ApiProperty({ description: 'Quantity of the product added to the cart' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'ID of the product added to the cart' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'ID of the associated cart' })
  @IsNumber()
  cartId: number;
}
