import { EntityManager } from '@mikro-orm/postgresql';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { User, RefreshToken } from 'src/entities';
import { Role } from '../../common/enums';
import * as argon2 from 'argon2';
import { JwtAuthService } from './strategies/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async register(dto: CreateUserDto) {
    const existingUser = await this.em.findOne(User, {
      username: dto.username,
    });
    if (existingUser) {
      throw new ConflictException('User with this username already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = this.em.create(User, {
      ...dto,
      password: hashedPassword,
      roles: [Role.USER],
    });

    await this.em.persistAndFlush(user);
    return user;
  }

  async login(username: string, password: string) {
    const user = await this.em.findOne(User, { username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.jwtAuthService.generateAccessToken(user);
    const refreshToken = this.jwtAuthService.generateRefreshToken(user);

    // Store refresh token in database
    const refreshTokenEntity = this.em.create(RefreshToken, {
      token: refreshToken,
      user: user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.em.persistAndFlush(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const payload = this.jwtAuthService.verifyRefreshToken(refreshToken);

    const tokenEntity = await this.em.findOne(RefreshToken, {
      token: refreshToken,
      isRevoked: false,
    });

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.em.findOneOrFail(User, { id: payload.sub });

    const newAccessToken = this.jwtAuthService.generateAccessToken(user);
    const newRefreshToken = this.jwtAuthService.generateRefreshToken(user);

    // Store new refresh token
    const newRefreshTokenEntity = this.em.create(RefreshToken, {
      token: newRefreshToken,
      user: user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.em.persistAndFlush(newRefreshTokenEntity);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenEntity = await this.em.findOne(RefreshToken, {
      token: refreshToken,
    });

    if (tokenEntity) {
      tokenEntity.isRevoked = true;
      await this.em.persistAndFlush(tokenEntity);
    }
  }
}
