import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

@Entity()
export class User {
  @PrimaryKey({ hidden: false, index: true })
  id!: number;

  @Property({ index: true })
  idx?: string = randomUUID();

  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;
}
