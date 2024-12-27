import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ChangePasswordResponses() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Юзер  успешно сменил пароль',
    }),
    ApiResponse({
      status: 401,
      description: 'пользователь не вошел в свой аккаунт',
    }),
    ApiResponse({
      status: 400,
      description:
        'Новые пароли не равны / старый пароль такой же как и новый / старые пароли не совпадают ( типо нужен старый пароль чтобы поставить новый )',
    }),
  );
}
