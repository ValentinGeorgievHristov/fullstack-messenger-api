import { UserEntity } from '../user.entity';
import { UserModel } from './user.model';

export function mapUserEntityToModel(user: UserEntity): UserModel {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
