import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { User } from './user.entity';
import { TaskPriority } from 'src/common/enums';

@Entity()
export class Task {
  @PrimaryKey({ hidden: false, index: true })
  id!: number;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  description!: string;

  @Property({ default: false })
  completed!: boolean;

  @Enum(() => TaskPriority)
  priority!: TaskPriority;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
