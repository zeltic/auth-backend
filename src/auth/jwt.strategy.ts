// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // El 'payload' que entra aquí es lo que JwtService firmó, que tiene 'sub'.
  // El valor que retornamos es lo que se adjuntará a 'req.user', que queremos que sea del tipo 'JwtPayload'.
  validate(payload: { sub: number; role: string }): JwtPayload {
    // Ya no es necesario el "async" si no hay operaciones asíncronas
    return { userId: payload.sub, role: payload.role }; // Transformamos de 'sub' a 'userId'
  }
}
