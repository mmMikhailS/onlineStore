import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class createOrderDto {
  @ApiProperty({ description: " it's name" })
  @IsString({ message: 'status is not a  string' })
  status: string;

  @ApiProperty({ description: " it's content" })
  @IsObject({ message: 'items is not object' })
  items: Types.ObjectId[];

  @ApiProperty({ description: " it's typeName" })
  @IsObject({ message: 'user is not object' })
  user: string;
}
