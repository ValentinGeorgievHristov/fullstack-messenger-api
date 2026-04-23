import { UserModel } from '../../users/user-models/user.model';

export class AuthResponseModel {
  accessToken!: string;
  user!: UserModel;
}
