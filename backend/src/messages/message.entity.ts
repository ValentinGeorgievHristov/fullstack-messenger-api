import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MessageModel } from './message-models/message.model';

@Entity({ name: 'messages' })
export class MessageEntity implements MessageModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'int', default: 0 })
  senderUserId!: number;

  @Column({ type: 'int', default: 0 })
  receiverUserId!: number;
}
