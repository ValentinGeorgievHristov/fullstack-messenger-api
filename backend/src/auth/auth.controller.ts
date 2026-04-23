import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseModel } from './auth-models/auth-response.model';
import { LoginModel } from './auth-models/login.model';
import { RegisterModel } from './auth-models/register.model';
import { AuthGuard } from './auth.guard';
import { AuthenticatedRequest } from './auth.types';
import { UserModel } from '../users/user-models/user.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterModel): Promise<AuthResponseModel> {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginModel): Promise<AuthResponseModel> {
    return this.authService.login(body);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() request: AuthenticatedRequest): Promise<UserModel> {
    return this.authService.getCurrentUser(request.user.id);
  }
}
