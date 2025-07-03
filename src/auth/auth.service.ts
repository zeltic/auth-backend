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
      // Genera token 2FA y envíalo por correo/SMS aquí
      // return { message: 'Código 2FA enviado', userId: user.id };
      const payload = { sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async verify2FA(userId: number, code: string) {
    // const user = await this.usersService.findOne(userId);
    // const payload = { sub: userId, role: user.role }; // Incluye rol en payload
    const payload = { sub: userId }; // Incluye rol en payload
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
