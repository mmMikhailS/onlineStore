import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindUserInterface } from '../interfaces/prisma/findUser.interface';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserById(userId: number): Promise<FindUserInterface> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
        id: true,
        email: true,
      },
    });
  }
}
