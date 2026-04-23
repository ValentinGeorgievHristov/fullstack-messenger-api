import { Request } from 'express';
import { UserEntity } from '../users/user.entity';

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserEntity;
}
