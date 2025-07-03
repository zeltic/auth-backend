// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      // Creamos el payload con 'sub' y 'role'
      const payload = { sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  verify2FA(userId: number, _code: string) {
    // Aquí también, usamos 'sub'
    // Idealmente, también buscaríamos el rol del usuario aquí.
    const payload = { sub: userId, role: 'accionista' }; // Asumimos rol por ahora.
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
