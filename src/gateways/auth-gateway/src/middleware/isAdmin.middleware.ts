import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { PayloadInterface } from '../interfaces/payload.interface';
import { FindUserMiddlewareInterface } from '../interfaces/findUserMiddleware.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class isAdminMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  private findUser(userId: number): Promise<FindUserMiddlewareInterface> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        isAdmin: true,
      },
    });
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const header: string =
        req.headers[this.authService.REFRESH_TOKEN_HEADER_NAME];
      if (!header)
        throw new UnauthorizedException('Authorization header is missing');

      const refreshToken: string = header.split(' ')[1];
      if (!header) throw new UnauthorizedException('Token is missing');

      const { id }: PayloadInterface = await this.jwt.verify(refreshToken);
      if (!id) throw new UnauthorizedException('Invalid token');

      const { isAdmin }: FindUserMiddlewareInterface = await this.findUser(id);
      if (!isAdmin) throw new BadRequestException('not enough rights');
      req.payload = { id };
      next();
    } catch (e) {
      res.status(403).json({ message: e });
    }
  }
}
