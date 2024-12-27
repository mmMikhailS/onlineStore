import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateProductQuantityDto {
  @ApiProperty({
    description: 'The unique identifier of the product.',
  })
  @IsString({ message: 'product name must be a string.' })
  @IsNotEmpty({ message: 'product  name cannot be empty.' })
  productName: string;

  @ApiProperty({
    description: 'The quantity of the product to update.',
  })
  @IsNumber({}, { message: 'quantity must be a number.' })
  @IsNotEmpty({ message: 'quantity cannot be empty.' })
  quantity: number;
}
