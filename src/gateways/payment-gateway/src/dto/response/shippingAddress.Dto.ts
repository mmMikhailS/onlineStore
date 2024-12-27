import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPostalCode,
  IsString,
} from 'class-validator';

class AddressDto {
  @IsString({ message: 'addressLine1 must be a string.' })
  @IsNotEmpty({ message: 'addressLine1 cannot be empty.' })
  addressLine1: string;

  @IsString({ message: 'addressLine2 must be a string.' })
  @IsOptional()
  addressLine2?: string;

  @IsString({ message: 'adminArea1 must be a string.' })
  @IsNotEmpty({ message: 'adminArea1 cannot be empty.' })
  adminArea1: string;

  @IsString({ message: 'adminArea2 must be a string.' })
  @IsNotEmpty({ message: 'adminArea2 cannot be empty.' })
  adminArea2: string;

  @IsString({ message: 'postalCode must be a string.' })
  @IsPostalCode('UA', {
    message: 'postalCode must match the postal code format for Ukraine.',
  })
  postalCode: string;

  @IsString({ message: 'countryCode must be a string.' })
  @IsNotEmpty({ message: 'countryCode cannot be empty.' })
  countryCode: string;
}

class PhoneNumberDto {
  @IsString({ message: 'countryCode must be a string.' })
  @IsNotEmpty({ message: 'countryCode cannot be empty.' })
  countryCode: string;

  @IsString({ message: 'nationalNumber must be a string.' })
  @IsNotEmpty({ message: 'nationalNumber cannot be empty.' })
  nationalNumber: string;
}

export class ShippingAddressDto {
  @IsObject({ message: 'address must be an object.' })
  @IsNotEmpty({ message: 'address cannot be empty.' })
  address: AddressDto;

  @IsObject({ message: 'phoneNumber must be an object.' })
  @IsNotEmpty({ message: 'phoneNumber cannot be empty.' })
  phoneNumber: PhoneNumberDto;
}
