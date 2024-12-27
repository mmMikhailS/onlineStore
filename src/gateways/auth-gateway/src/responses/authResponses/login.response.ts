import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function LoginResponses() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Юзер  успешно вошел',
    }),
    ApiResponse({
      status: 401,
      description: 'пользователь не зарегистрирован',
    }),
    ApiResponse({
      status: 400,
      description: 'неправильный пароль',
    }),
  );
}
