import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserModel } from './user-models/user.model';

@Entity({ name: 'users' })
export class UserEntity implements UserModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  email!: string;
}
