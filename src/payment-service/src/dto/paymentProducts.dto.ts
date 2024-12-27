import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ProductDto {
  @IsString({ message: 'The "name" field must be a string.' })
  @IsNotEmpty({ message: 'The "name" field cannot be empty.' })
  name: string;

  @IsString({ message: 'The "description" field must be a string.' })
  @IsNotEmpty({ message: 'The "description" field cannot be empty.' })
  description: string;

  @IsNumber({}, { message: 'The "quantity" field must be a number.' })
  @IsNotEmpty({ message: 'The "quantity" field cannot be empty.' })
  quantity: number;

  @IsString({ message: 'The "type" field must be a string.' })
  @IsNotEmpty({ message: 'The "type" field cannot be empty.' })
  type: string;

  @IsString({ message: 'The "amount" field must be a string.' })
  @IsNotEmpty({ message: 'The "amount" field cannot be empty.' })
  amount: string;
}