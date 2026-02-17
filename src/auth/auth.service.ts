import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

const REFRESH_COOKIE_NAME = 'refresh_token';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  getRefreshCookieName() {
    return REFRESH_COOKIE_NAME;
  }

  private getAccessSecret(): string {
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
    return secret;
  }

  private getRefreshSecret(): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
    return secret;
  }


  getRefreshCookieOptions() {
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: maxAgeMs,
    };
  }

  private async signTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.getAccessSecret(),
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.getRefreshSecret(),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }


  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, passwordHash);

    const { accessToken, refreshToken } = await this.signTokens((user as any)._id.toString(), user.email);

    return {
      user: { id: (user as any)._id.toString(), email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, (user as any).passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const userId = (user as any)._id.toString();
    const { accessToken, refreshToken } = await this.signTokens(userId, user.email);

    return {
      user: { id: userId, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub as string | undefined;
    const email = payload.email as string | undefined;

    if (!userId || !email) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userWithHash = await this.usersService.findByIdWithRefreshHash(userId);
    const storedHash = (userWithHash as any)?.refreshTokenHash as string | null | undefined;

    if (!userWithHash || !storedHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(refreshToken, storedHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.signTokens(userId, email);
    await this.storeRefreshTokenHash(userId, tokens.refreshToken);

    return {
      user: { id: userId, email },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.setRefreshTokenHash(userId, null);
  }
}