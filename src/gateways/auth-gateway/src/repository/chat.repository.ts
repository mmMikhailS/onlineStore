import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  async deleteUserChats(userId: number): Promise<void> {
    await this.prisma.chat.deleteMany({
      where: { users: { some: { id: userId } } },
    });
  }
}
