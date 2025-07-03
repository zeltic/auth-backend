import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.validateUser(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa')
  async verify2FA(@Request() req, @Body('code') code: string) {
    return this.authService.verify2FA(req.user.id, code);
  }
}
