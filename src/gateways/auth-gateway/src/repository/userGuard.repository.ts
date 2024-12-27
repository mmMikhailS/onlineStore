import { PrismaService } from '../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserGuardInterface } from '../interfaces/userGuard.interface';
import { ExpirationPassInterface } from '../interfaces/expirationPass.interface';

@Injectable()
export class UserGuardRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserGuard(userId: number): Promise<UserGuardInterface | null> {
    return this.prisma.userGuard.findUnique({
      where: { userId },
      select: {
        authApp: true,
        doubleGuardPass: true,
        doubleGuardPasswords: true,
        secret2fa: true,
      },
    });
  }

  async create(userId: number): Promise<void> {
    await this.prisma.userGuard.create({
      data: {
        userId,
      },
    });
  }

  async updateGuardPasswords(
    passwords: string[],
    userId: number,
    expirationDays?: number,
  ): Promise<void> {
    const expirationDate: ExpirationPassInterface = expirationDays
      ? {
          expirationPass: new Date(
            Date.now() + expirationDays * 24 * 3600 * 1000,
          ),
        }
      : undefined;
    await this.prisma.userGuard.update({
      where: {
        id: userId,
      },
      data: {
        doubleGuardPasswords: passwords,
        doubleGuardPass: true,
        ...(expirationDate && {
          expirationPass: expirationDate.expirationPass,
        }),
      },
    });
  }

  async updateUserSecret2fa(secret: string, userId: number): Promise<void> {
    await this.prisma.userGuard.update({
      where: {
        userId,
      },
      data: {
        secret2fa: secret,
      },
    });
  }

  async deleteGuardByUserId(userId: number): Promise<void> {
    await this.prisma.userGuard.delete({
      where: { userId },
    });
  }
}
