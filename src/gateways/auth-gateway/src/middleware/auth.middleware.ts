import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { PayloadInterface } from '../interfaces/payload.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const header: string =
        req.headers[this.authService.REFRESH_TOKEN_HEADER_NAME];
      if (!header)
        throw new UnauthorizedException('Authorization header is missing');

      const refreshToken: string = header.split(' ')[1];
      if (!header) throw new UnauthorizedException('Token is missing');

      const payload: PayloadInterface = await this.jwt.verify(refreshToken);
      if (!payload) throw new UnauthorizedException('invalid token');
      req.payload = payload;
      next();
    } catch (e) {
      res.status(403).json({ message: e });
    }
  }
}
