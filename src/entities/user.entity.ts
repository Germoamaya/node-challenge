import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { Role } from '../common/enums/role.enum';

@Entity()
export class User {
  @PrimaryKey({ hidden: false, index: true })
  id!: number;

  @Property({ unique: true })
  username!: string;

  @Property()
  password!: string;

  @Enum({ items: () => Role, array: true })
  roles?: Role[];

  @Property()
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
