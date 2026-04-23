import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { AuthenticatedRequest, JwtPayload } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      throw new UnauthorizedException('Authentication is required.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('AUTH_JWT_SECRET'),
      });
      const userId = Number(payload.sub);

      if (!Number.isInteger(userId) || userId < 1) {
        throw new UnauthorizedException('Authentication is required.');
      }

      const user = await this.userRepository.findOneBy({ id: userId });

      if (!user) {
        throw new UnauthorizedException('Authentication is required.');
      }

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Authentication is required.');
    }
  }
}
