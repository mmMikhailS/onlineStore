import 'express';

declare module 'express' {
  interface Request {
    guardPayload?: {
      id: number;
    };
    payload?: {
      id: number;
    };
  }
}
