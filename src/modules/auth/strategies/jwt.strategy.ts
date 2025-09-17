// auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface AccessTokenPayload {
  userId: string; // user id
  username: string; // optional, useful in req.user
  roles?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // read from Authorization: Bearer
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: AccessTokenPayload) {
    // What ends up in req.user
    return {
      userId: payload.userId,
      username: payload.username,
      roles: payload.roles || [],
    };
  }
}
