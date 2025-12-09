import { Injectable, UnauthorizedException } from '@nestjs/common';

function parseExpiry(str: string): number {
  const match = /^([0-9]+)([smhd])$/.exec(str);
  if (!match) throw new Error('Invalid expiry format');
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error('Invalid expiry unit');
  }
}
function normalizeExpiry(str: string, fallback: string): string {
  const s = (str || '').trim();
  return /^[0-9]+[smhd]$/.test(s) ? s : fallback;
}
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginAuthDto } from './dto/login-auth.dto';
import { CreateRefreshDto } from './dto/create-refresh.dto';
import { LogoutAuthDto } from './dto/logout-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async login(dto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        phone: true,
        isActive: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const accessTokenExpiry = normalizeExpiry(
      process.env.ACCESS_TOKEN_EXPIRY || '15m',
      '15m',
    );
    const refreshTokenExpiry = normalizeExpiry(
      process.env.REFRESH_TOKEN_EXPIRY || '7d',
      '7d',
    );
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      jwtSecret,
      {
        expiresIn: accessTokenExpiry,
      },
    );
    const refreshToken = jwt.sign(
      { sub: user.id, email: user.email },
      jwtSecret,
      {
        expiresIn: refreshTokenExpiry,
      },
    );
    const expiresAt = new Date(Date.now() + parseExpiry(refreshTokenExpiry))
      .getTime()
      .toString();
    await this.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        isActive: user.isActive,
      },
    };
  }
  async saveRefreshToken(createRefreshDto: CreateRefreshDto) {
    return this.prisma.refreshToken.create({
      data: {
        userId: createRefreshDto.userId,
        token: createRefreshDto.token,
        expiresAt: createRefreshDto.expiresAt,
      },
    });
  }

  async logout(dto: LogoutAuthDto) {
    try {
      // Revoke refresh token by setting revokedAt
      await this.prisma.refreshToken.updateMany({
        where: {
          token: dto.refreshToken,
          revokedAt: null, // Only update if not already revoked
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // Add access token to blacklist
      await this.prisma.blacklistToken.create({
        data: {
          token: dto.accessToken,
        },
      });

      return {
        message: 'Logged out successfully',
        success: true,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
      const accessTokenExpiry = normalizeExpiry(
        process.env.ACCESS_TOKEN_EXPIRY || '15m',
        '15m',
      );
      const refreshTokenExpiry = normalizeExpiry(
        process.env.REFRESH_TOKEN_EXPIRY || '7d',
        '7d',
      );

      // Verify refresh token
      const decoded = jwt.verify(dto.refreshToken, jwtSecret) as any;

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token exists in database and is not revoked
      const refreshTokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          token: dto.refreshToken,
          revokedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              isActive: true,
            },
          },
        },
      });

      if (!refreshTokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token is expired
      const currentTime = Date.now().toString();
      if (refreshTokenRecord.expiresAt < currentTime) {
        await this.prisma.refreshToken.update({
          where: { id: refreshTokenRecord.id },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Check if user is still active
      if (!refreshTokenRecord.user.isActive) {
        throw new UnauthorizedException('User account is disabled');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          sub: refreshTokenRecord.user.id,
          email: refreshTokenRecord.user.email,
        },
        jwtSecret,
        {
          expiresIn: accessTokenExpiry,
        },
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        {
          sub: refreshTokenRecord.user.id,
          email: refreshTokenRecord.user.email,
        },
        jwtSecret,
        {
          expiresIn: refreshTokenExpiry,
        },
      );

      const expiresAt = new Date(Date.now() + parseExpiry(refreshTokenExpiry))
        .getTime()
        .toString();

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { revokedAt: new Date() },
      });

      // Save new refresh token
      await this.saveRefreshToken({
        userId: refreshTokenRecord.user.id,
        token: newRefreshToken,
        expiresAt,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt,
        user: {
          id: refreshTokenRecord.user.id,
          email: refreshTokenRecord.user.email,
          name: refreshTokenRecord.user.name,
          phone: refreshTokenRecord.user.phone,
          isActive: refreshTokenRecord.user.isActive,
        },
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw error;
    }
  }
}
