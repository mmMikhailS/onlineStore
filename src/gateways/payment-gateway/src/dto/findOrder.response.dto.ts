import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class FindOrderResponseDto {
  @ApiProperty({ description: 'The error message' })
  @IsString({ message: 'error message is not a string' })
  @IsOptional()
  @Expose()
  errorMessage?: string;

  @ApiProperty({ description: 'The unique identifier of the order' })
  @IsNumber({}, { message: 'Order ID must be a valid number' })
  id: number;

  @ApiProperty({ description: 'The date and time when the order was created' })
  @IsDate({ message: 'Created date must be a valid date' })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the order was last updated',
  })
  @IsDate({ message: 'Updated date must be a valid date' })
  updatedAt: Date;

  @ApiProperty({ description: 'The current status of the order' })
  @IsString({
    message: 'Status must be one of the valid order statuses',
  })
  status: string;

  @ApiProperty({ description: 'The postal code associated with the order' })
  @IsString({ message: 'Postal code must be a valid string' })
  postalCode: string;

  @ApiProperty({ description: 'The city associated with the order' })
  @IsString({ message: 'City must be a valid string' })
  city: string;

  @ApiProperty({
    description: 'The phone number of the user placing the order',
  })
  @IsString({ message: 'Phone number must be a valid string' })
  phoneNumber: string;

  @ApiProperty({
    description: 'The unique identifier of the user who placed the order',
  })
  @IsNumber({}, { message: 'User ID must be a valid number' })
  userId: number;
}
