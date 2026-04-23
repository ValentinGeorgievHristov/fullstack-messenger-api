import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { mapUserEntityToModel } from '../users/user-models/user.mapper';
import { AuthResponseModel } from './auth-models/auth-response.model';
import { LoginModel } from './auth-models/login.model';
import { RegisterModel } from './auth-models/register.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async register(payload: RegisterModel): Promise<AuthResponseModel> {
    const name = payload.name.trim();
    const email = payload.email.trim().toLowerCase();
    const password = payload.password.trim();

    if (!name || !email || password.length < 6) {
      throw new BadRequestException('Valid name, email, and password are required.');
    }

    const existingUser = await this.userRepository.findOneBy({ email });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await hash(password, 10);
    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
    });
    const savedUser = await this.userRepository.save(user);

    return this.createAuthResponse(savedUser);
  }

  async login(payload: LoginModel): Promise<AuthResponseModel> {
    const email = payload.email.trim().toLowerCase();
    const password = payload.password.trim();

    if (!email || !password) {
      throw new BadRequestException('Valid email and password are required.');
    }

    const user = await this.userRepository.findOneBy({ email });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createAuthResponse(user);
  }

  async getCurrentUser(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`User ${userId} does not exist.`);
    }

    return mapUserEntityToModel(user);
  }

  private async createAuthResponse(user: UserEntity): Promise<AuthResponseModel> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: mapUserEntityToModel(user),
    };
  }
}
