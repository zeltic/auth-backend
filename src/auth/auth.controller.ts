// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RequestWithUser } from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    // Eliminamos "async" si no hay "await"
    return this.authService.validateUser(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa')
  verify2FA(@Request() req: RequestWithUser, @Body('code') code: string) {
    // Ahora req.user está correctamente tipado
    return this.authService.verify2FA(req.user.userId, code);
  }
}
