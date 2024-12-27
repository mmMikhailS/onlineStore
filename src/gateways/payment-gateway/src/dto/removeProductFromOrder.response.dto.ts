import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RemoveProductFromOrderResponseDto {
  @ApiProperty({ description: 'The error message' })
  @IsString({ message: 'error message is not a string' })
  @IsOptional()
  @Expose()
  errorMessage?: string;

  @ApiProperty({
    description: 'The unique identifier of the product removal response',
  })
  @IsNumber({}, { message: 'ID must be a valid number' })
  id: number;

  @ApiProperty({ description: 'The name' })
  @IsString({ message: 'name is not a string' })
  @Expose()
  name: string;
}
