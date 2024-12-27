import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from '../repository/token.repository';
import * as process from 'node:process';
import { TokensInterface } from '../interfaces/tokens.interface';
import { PayloadInterface } from '../interfaces/payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  createGuardAccessToken(userId: number): string {
    return this.jwt.sign(
      {
        id: userId,
      },
      {
        secret: process.env.SECRET_KEY,
        expiresIn: '20m',
      },
    );
  }

  async generateTokens(id: number): Promise<TokensInterface> {
    try {
      const data = { id };
      const refreshToken: string = await this.jwt.signAsync(data, {
        secret: process.env.SECRET_KEY,
        expiresIn: '30d',
      });
      await this.jwt.signAsync(data, {
        secret: process.env.SECRET_KEY,
        expiresIn: '30m',
      });

      return {
        refreshToken,
      };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw error;
    }
  }

  verify(refreshToken: string): Promise<PayloadInterface> {
    return this.jwt.verifyAsync(refreshToken, {
      secret: process.env.SECRET_KEY,
    });
  }

  async createToken(refreshToken: string, userId: number) {
    return this.tokenRepository.create(refreshToken, userId);
  }

  async updateToken(refreshToken: string, userId: number) {
    return this.tokenRepository.update(refreshToken, userId);
  }
}
