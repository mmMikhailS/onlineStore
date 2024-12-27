import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function DeleteProductBrandResponse() {
  return applyDecorators(
    ApiResponse({
      status: 204,
      description: 'Брэнд успешно удален',
    }),
  );
}
