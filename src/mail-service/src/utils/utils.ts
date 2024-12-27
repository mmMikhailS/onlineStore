export const topics = [
  'verification-mail',
  'login-mail',
  'change-password-mail',
  'order-mail',
  'google-verify-mail',
];

export type handlerType = (to: string, code?: string, status?: string) => any;

export type actionTopicType =
  | 'verification-mail'
  | 'login-mail'
  | 'change-password-mail'
  | 'order-mail'
  | 'google-verify-mail';
