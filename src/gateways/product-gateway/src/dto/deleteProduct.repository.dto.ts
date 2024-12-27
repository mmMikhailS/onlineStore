import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class DeleteProductInterface {
  @ApiProperty({ description: " it's error message" })
  @IsString({ message: 'error message is not a  string' })
  @IsOptional()
  @Expose()
  errorMessage?: string;

  @ApiProperty({
    description: 'The name of the product to be deleted',
  })
  @IsString({ message: 'Name must be a valid string' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'A brief description of the product',
  })
  @IsString({ message: 'Description must be a valid string' })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'The amount associated with the product',
  })
  @IsString({ message: 'Amount must be a valid string' })
  @Expose()
  amount: string;

  @ApiProperty({
    description: 'The type/category of the product',
  })
  @IsString({ message: 'Type must be a valid string' })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'The date and time when the product was created',
  })
  @IsDate({ message: 'CreatedAt must be a valid date' })
  @Expose()
  createdAt: Date;
}
