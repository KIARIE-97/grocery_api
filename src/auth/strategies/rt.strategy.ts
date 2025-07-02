import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';


type JWTPayload = {
  sub: number;
  email: string;
  [key: string]: any;
};
interface JwtPayloadWithRt extends JWTPayload {
  refreshToken: string;
}

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(private readonly configService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    };
    super(options);
  }
  validate(req: Request, payload: JWTPayload): JwtPayloadWithRt {
    const authHeader = req.get('Authorization');
    console.log('RtStrategy validate() called');
    if (!authHeader) {
      throw new Error('No refresh token provided');
    }
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    if (!refreshToken) {
      throw new Error('Invalid refresh token format');
    }
    return {
      ...payload, // attach request.user = payload;
      refreshToken,
    };
  }
}
// This strategy is used to validate long-lived refresh tokens.
// It extracts the refresh token from the Authorization header, validates it, and attaches the payload to the request.
// The validate method also extracts the refresh token from the request and includes it in the returned payload