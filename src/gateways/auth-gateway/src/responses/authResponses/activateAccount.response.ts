import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ActivateAccountResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'не верный пароль',
    }),
    ApiResponse({
      status: 401,
      description: 'юзер не зарегистрирован ( без рефреш токена )',
    }),
  );
}
