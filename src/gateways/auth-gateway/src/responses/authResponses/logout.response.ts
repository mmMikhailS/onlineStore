import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function LogoutResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Successfully logged out',
    }),
    ApiResponse({
      status: 401,
      description: 'User not signed up in our service',
    }),
    ApiResponse({
      status: 500,
      description: 'Logout error',
    }),
  );
}
