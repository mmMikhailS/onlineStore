import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function RefreshResponses() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Юзер  успешно обновил токены',
    }),
    ApiResponse({
      status: 401,
      description: 'пользователь не вошел в свой аккаунт  (без рефреш токена) ',
    }),
  );
}
