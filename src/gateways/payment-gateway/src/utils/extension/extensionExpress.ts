import 'express';

declare module 'express' {
  export interface Request {
    payload?: {
      id: number;
    };
  }
}
