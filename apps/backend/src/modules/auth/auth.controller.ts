import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/login.dto';
import { RefreshTokenDto } from './refresh-token.dto';

@ApiTags('auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 attempts per 60 seconds
  async login(@Body() dto: LoginDto, @Request() req: any) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user || typeof user.id !== 'number' || !user.email || !user.role) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout (invalidate refresh token)' })
  async logout(@Body() dto: RefreshTokenDto) {
    // In production, you'd add the refresh token to a blacklist
    // For now, we just acknowledge the logout
    return { message: 'Logged out successfully' };
  }
}
