import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from './admin-user.entity';

@Injectable()
export class AuthService {
  // Salt for bcrypt - in production, use env variable
  private readonly BCRYPT_SALT_ROUNDS = 10;
  
  // Legacy salt for SHA256 migration
  private readonly LEGACY_SALT = 'medikom-plus-salt-2025';
  private readonly USE_LEGACY_HASH = true; // Set to false after migration

  constructor(
    @InjectRepository(AdminUser)
    private readonly usersRepository: Repository<AdminUser>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Partial<AdminUser> | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    // Try bcrypt first
    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password);
    } catch {
      // Not a bcrypt hash
    }

    // If bcrypt failed, try legacy SHA256
    if (!isValid) {
      isValid = this.hashPasswordLegacy(password) === user.password;
    }

    if (isValid) {
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Pick<AdminUser, 'id' | 'email' | 'role'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '24h' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload && payload.sub && payload.email) {
        return {
          accessToken: this.jwtService.sign(payload, { expiresIn: '24h' }),
        };
      }
    } catch {
      // Token invalid
    }
    throw new UnauthorizedException('Invalid refresh token');
  }

  // Legacy SHA256 hash (for migration compatibility)
  hashPasswordLegacy(password: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password + this.LEGACY_SALT).digest('hex');
  }

  // New bcrypt hash
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_SALT_ROUNDS);
  }

  // Check if password needs migration and migrate if needed
  async migratePasswordIfNeeded(user: AdminUser, plainPassword: string): Promise<boolean> {
    const isLegacyHash = this.USE_LEGACY_HASH && user.password === this.hashPasswordLegacy(plainPassword);
    
    if (isLegacyHash) {
      // Migrate to bcrypt
      user.password = await this.hashPassword(plainPassword);
      await this.usersRepository.save(user);
      return true;
    }
    return false;
  }

  async createAdminUser(email: string, password: string, name: string, role: 'admin' | 'editor' = 'editor') {
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Admin user already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    return this.usersRepository.save(user);
  }

  async findOneById(id: number): Promise<AdminUser | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
