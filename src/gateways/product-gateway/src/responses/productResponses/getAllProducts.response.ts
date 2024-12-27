import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function GetAllProductsResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Пользователи успешно получены',
    }),
  );
}
