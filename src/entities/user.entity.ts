import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../common/enums/role.enum';

@Entity()
export class User {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 1,
  })
  @PrimaryKey({ hidden: false, index: true })
  id!: number;

  @ApiProperty({
    description: 'Unique username for authentication',
    example: 'john_doe',
  })
  @Property({ unique: true })
  username!: string;

  @ApiProperty({
    description: 'Hashed password (not returned in responses)',
    example: '$argon2id$v=19...',
    writeOnly: true,
  })
  @Property()
  password!: string;

  @ApiProperty({
    description: 'User roles for authorization',
    enum: ['USER', 'ADMIN'],
    example: ['USER'],
    isArray: true,
  })
  @Enum({ items: () => Role, array: true })
  roles?: Role[];

  @ApiProperty({
    description: 'ISO timestamp when the user was created',
    example: '2025-01-01T10:00:00.000Z',
  })
  @Property()
  createdAt?: Date = new Date();

  @ApiProperty({
    description: 'ISO timestamp when the user was last updated',
    example: '2025-01-01T15:30:00.000Z',
  })
  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
