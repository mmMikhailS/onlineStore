import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { PayloadInterface } from '../interfaces/payload.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwt: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const header: string = req.headers['authorization'];
      if (!header)
        throw new UnauthorizedException('Authorization header is missing');

      const refreshToken: string = header.split(' ')[1];
      if (!refreshToken) throw new UnauthorizedException('Token is missing');

      const payload: PayloadInterface = await this.jwt.verify(refreshToken);
      if (!payload.id) throw new UnauthorizedException('invalid token');
      req.payload = payload;
      next();
    } catch (e) {
      res.status(403).json({ message: e.message });
    }
  }
}
