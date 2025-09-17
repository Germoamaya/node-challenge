import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
import { RefreshToken, User } from 'src/entities';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {}

  generateAccessToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      roles: user.roles,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      roles: user.roles,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
  }

  verifyAccessToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  verifyRefreshToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async getRefreshTokenByUserId(userId: number): Promise<RefreshToken | null> {
    return await this.em.findOne(RefreshToken, { user: userId });
  }
}
