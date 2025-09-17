import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from './user.entity';

@Entity()
export class RefreshToken {
  @PrimaryKey({ hidden: false, index: true })
  id!: number;

  @Property({ unique: true })
  token!: string;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  expiresAt!: Date;

  @Property({ default: false })
  isRevoked?: boolean;

  @Property()
  createdAt?: Date = new Date();
}
