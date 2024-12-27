import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindUserByTokenInterface } from '../interfaces/prisma/findUserByToken.interface';
import { TokenRecordInterface } from '../interfaces/tokenRecord.interface';
import { DeleteTokenInterface } from '../interfaces/prisma/deleteToken.interface';
import { IsCreatedTokensInterface } from '../interfaces/prisma/isCreatedTokens.interface';

@Injectable()
export class TokenRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByToken(
    refreshToken: string,
  ): Promise<FindUserByTokenInterface> {
    return this.prisma.token.findFirst({
      where: {
        refreshToken: {
          has: refreshToken,
        },
      },
      select: {
        userId: true,
      },
    });
  }

  async clearAllTokens(userId: number): Promise<void> {
    await this.prisma.token.update({
      where: {
        userId,
      },
      data: {
        refreshToken: [],
      },
    });
  }

  async deleteAllTokens(userId: number): Promise<void> {
    await this.prisma.token.delete({
      where: {
        userId,
      },
    });
  }

  async deleteToken(refreshToken: string): Promise<DeleteTokenInterface> {
    const tokenRecord: TokenRecordInterface = await this.prisma.token.findFirst(
      {
        where: {
          refreshToken: {
            has: refreshToken,
          },
        },
        select: {
          refreshToken: true,
          id: true,
        },
      },
    );
    if (!tokenRecord) {
      throw new BadRequestException('user not registered');
    }

    const updatedTokens: string[] = tokenRecord.refreshToken.filter(
      (token: string): boolean => token !== refreshToken,
    );

    return this.prisma.token.update({
      where: {
        id: tokenRecord.id,
      },
      data: {
        refreshToken: updatedTokens,
      },
      select: {
        refreshToken: true,
      },
    });
  }

  async create(refreshToken: string, userId: number): Promise<void> {
    const tokens: IsCreatedTokensInterface = await this.prisma.token.findUnique(
      {
        where: { userId },
        select: { id: true },
      },
    );
    if (!tokens) {
      await this.prisma.token.create({
        data: {
          refreshToken: [refreshToken],
          user: {
            connect: { id: userId },
          },
        },
      });
      return;
    }
    this.prisma.token.update({
      where: {
        userId,
      },
      data: {
        refreshToken: {
          push: refreshToken,
        },
      },
    });
    return;
  }

  async update(refreshToken: string, userId: number): Promise<void> {
    await this.prisma.token.upsert({
      where: { userId },
      update: {
        refreshToken: {
          push: refreshToken,
        },
      },
      create: {
        refreshToken: [refreshToken],
        userId,
      },
    });
  }
}
