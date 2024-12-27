import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class AddProductToOrderDto {
  @ApiProperty({ description: 'The error message' })
  @IsNumber({}, { message: 'quantity is not a string' })
  quantity: number;

  @ApiProperty({ description: 'The error message' })
  @IsString({ message: 'product name is not a string' })
  productName: string;
}
