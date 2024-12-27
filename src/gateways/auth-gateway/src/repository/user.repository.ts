import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserPasswordInterface } from '../interfaces/prisma/UserPassword.interface';
import { DeleteAccountResponseDto } from '../dto/responseDto/deleteAccount.response.dto';
import { ChangePasswordResponseDto } from '../dto/responseDto/changePassword.response.dto';
import { CreateUserInterface } from '../interfaces/prisma/createUser.interface';
import { FindUserIdByEmailInterface } from '../interfaces/prisma/findUserIdByEmail.interface';
import { FindUserChangesByEmailInterface } from '../interfaces/prisma/findUserChangesByEmail.interface';
import { FindUserByIdInterface } from '../interfaces/findUserById.interface';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  findUserById(id: number): Promise<FindUserByIdInterface> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
      },
    });
  }

  findUserPasswordByEmail(
    email: string,
  ): Promise<UserPasswordInterface | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
      },
    });
  }

  findUserChangesByEmail(
    email: string,
  ): Promise<FindUserChangesByEmailInterface | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        counter: true,
        updatedPasswordAt: true,
      },
    });
  }

  findUserIdByEmail(email: string): Promise<FindUserIdByEmailInterface> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
      },
    });
  }

  async updateChangesPasswordCounter(
    userId: number,
    counter?: number,
  ): Promise<void> {
    this.prisma.user.update({
      where: { id: userId },
      data: {
        counter: counter !== undefined ? counter : { increment: 1 },
        updatedPasswordAt: new Date(),
      },
    });
  }

  updateUserPassword(
    email: string,
    password: string,
  ): Promise<ChangePasswordResponseDto> {
    return this.prisma.user.update({
      where: { email },
      data: {
        password,
        counter: { increment: 1 },
      },
      select: {
        id: true,
        isAdmin: true,
        fullName: true,
      },
    });
  }

  createUser(
    email: string,
    fullName: string,
    password?: string,
  ): Promise<CreateUserInterface> {
    return this.prisma.user.create({
      data: {
        email,
        password,
        fullName,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });
  }

  deleteUser(id: number): Promise<DeleteAccountResponseDto> {
    return this.prisma.user.delete({
      where: { id },
      select: {
        email: true,
        fullName: true,
        isAdmin: true,
      },
    });
  }
}
