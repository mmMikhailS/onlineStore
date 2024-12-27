import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetActivateUserInterface } from '../interfaces/prisma/getActivateUser.interface';
import { ActivateAccountInterface } from '../interfaces/activateAccount.interface';
import { UpdateActivateInterface } from '../interfaces/prisma/updateActivate.interface';

@Injectable()
export class ActivateRepository {
  constructor(private prisma: PrismaService) {}

  async findActivateUserById(id: number): Promise<GetActivateUserInterface> {
    return this.prisma.activateUser.findUnique({
      where: {
        userId: id,
      },
      select: {
        isActivated: true,
        activationLink: true,
      },
    });
  }

  async findActivateAccountUserById(
    id: number,
  ): Promise<ActivateAccountInterface> {
    return this.prisma.activateUser.findUnique({
      where: {
        userId: id,
      },
      select: {
        activationCode: true,
        activationLink: true,
      },
    });
  }

  async updateActivate(userId: number): Promise<UpdateActivateInterface> {
    return this.prisma.activateUser.update({
      where: { userId },
      data: {
        isActivated: true,
        activationCode: '',
      },
      select: {
        id: true,
        activationLink: true,
        isActivated: true,
      },
    });
  }

  async create(
    activationLink: string,
    activationCode: string,
    userId: number,
  ): Promise<void> {
    await this.prisma.activateUser.create({
      data: {
        activationLink,
        activationCode,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async deleteById(userId: number): Promise<void> {
    await this.prisma.activateUser.delete({
      where: {
        userId,
      },
    });
  }
}
