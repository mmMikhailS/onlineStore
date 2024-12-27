import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class GetAllProductsDto {
  @ApiProperty({ description: " it's field" })
  @IsString({ message: 'field is not a string ' })
  field: string;

  @ApiProperty({ description: " it's order" })
  @IsEnum(['asc', 'desc'], { message: "order must be either 'asc' or 'desc' " })
  order: 'asc' | 'desc';
}
