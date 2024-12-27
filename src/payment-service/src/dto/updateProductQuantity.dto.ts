import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductQuantityDto {
  @ApiProperty({ description: 'The product name of the product' })
  @IsString({ message: 'product Name must be a valid string' })
  productName: string;

  @ApiProperty({ description: 'The quantity of the product to update' })
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  quantity: number;

  @ApiProperty({ description: 'The user id' })
  @IsNumber({}, { message: 'User id must be a valid number' })
  userId: number;
}
