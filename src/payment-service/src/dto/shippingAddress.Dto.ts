import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPostalCode,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty({
    description: 'The first line of the address',
  })
  @IsString({ message: 'addressLine1 must be a string.' })
  @IsNotEmpty({ message: 'addressLine1 cannot be empty.' })
  addressLine1: string;

  @ApiProperty({
    description: 'The second line of the address (optional)',
    required: false,
  })
  @IsString({ message: 'addressLine2 must be a string.' })
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({
    description: 'The region or state of the address',
  })
  @IsString({ message: 'adminArea1 must be a string.' })
  @IsNotEmpty({ message: 'adminArea1 cannot be empty.' })
  adminArea1: string;

  @ApiProperty({
    description: 'The city or district of the address',
  })
  @IsString({ message: 'adminArea2 must be a string.' })
  @IsNotEmpty({ message: 'adminArea2 cannot be empty.' })
  adminArea2: string;

  @ApiProperty({
    description: 'The postal code of the address',
  })
  @IsString({ message: 'postalCode must be a string.' })
  @IsPostalCode('UA', {
    message: 'postalCode must match the postal code format for Ukraine.',
  })
  postalCode: string;

  @ApiProperty({
    description: 'The country code in ISO Alpha-2 format',
  })
  @IsString({ message: 'countryCode must be a string.' })
  @IsNotEmpty({ message: 'countryCode cannot be empty.' })
  countryCode: string;
}

class PhoneNumberDto {
  @ApiProperty({
    description: 'The country code of the phone number',
  })
  @IsString({ message: 'countryCode must be a string.' })
  @IsNotEmpty({ message: 'countryCode cannot be empty.' })
  countryCode: string;

  @ApiProperty({
    description: 'The national phone number',
  })
  @IsString({ message: 'nationalNumber must be a string.' })
  @IsNotEmpty({ message: 'nationalNumber cannot be empty.' })
  nationalNumber: string;
}

export class ShippingAddressDto {
  @ApiProperty({
    description: 'The shipping address',
  })
  @IsObject({ message: 'address must be an object.' })
  @IsNotEmpty({ message: 'address cannot be empty.' })
  address: AddressDto;

  @ApiProperty({
    description: 'The phone number',
  })
  @IsObject({ message: 'phoneNumber must be an object.' })
  @IsNotEmpty({ message: 'phoneNumber cannot be empty.' })
  phoneNumber: PhoneNumberDto;
}
