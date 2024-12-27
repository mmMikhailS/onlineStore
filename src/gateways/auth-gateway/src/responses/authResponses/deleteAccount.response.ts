import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function DeleteAccountResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Successfully deleted account',
    }),
    ApiResponse({
      status: 401,
      description: 'User not signed up in our service',
    }),
    ApiResponse({
      status: 500,
      description: 'Delete error',
    }),
  );
}
