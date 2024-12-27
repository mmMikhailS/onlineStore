import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from '../repository/token.repository';
export declare class TokenService {
    private jwt;
    private tokenRepository;
    constructor(jwt: JwtService, tokenRepository: TokenRepository);
    generateAccessToken(payload: {
        access: string;
    }): Promise<string>;
    generateTokens(payload: any): Promise<{
        refreshToken: string;
        accessToken: string;
    }>;
    verify(refrsehToken: string): Promise<any>;
    createToken(refreshToken: string, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        refreshToken: string;
        userId: number;
    }>;
    updateToken(refreshToken: string, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        refreshToken: string;
        userId: number;
    }>;
    deleteAllTokens(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
