import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class doubleGuardMiddleware implements NestMiddleware {
  constructor(
    private jwt: JwtService,
    private readonly authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const header: string = req.headers[
        this.authService.GUARD_TOKEN_HEADER_NAME
      ] as string;
      if (!header)
        throw new UnauthorizedException('Authorization header is missing');

      const guardAccess: string = header.split(' ')[1];
      if (!header) throw new UnauthorizedException('Token is missing');

      const guardPayload = await this.jwt.verify(guardAccess.toString());
      if (!guardPayload) throw new UnauthorizedException('invalid token');
      req.guardPayload = guardPayload;
      next();
    } catch (e) {
      res.status(403).json({ message: e });
    }
  }
}
