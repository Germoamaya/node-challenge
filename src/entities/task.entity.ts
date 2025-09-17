import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { TaskPriority } from 'src/common/enums';

@Entity()
export class Task {
  @ApiProperty({
    description: 'Unique identifier of the task',
    example: 1,
  })
  @PrimaryKey({ hidden: false, index: true })
  id!: number;

  @ApiProperty({
    description: 'Title of the task',
    example: 'Complete project documentation',
  })
  @Property()
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Write comprehensive API documentation with examples',
    required: false,
  })
  @Property({ type: 'text' })
  description!: string;

  @ApiProperty({
    description: 'Whether the task is completed',
    example: false,
  })
  @Property({ default: false })
  completed!: boolean;

  @ApiProperty({
    description: 'Priority level of the task',
    enum: ['low', 'medium', 'high'],
    example: 'medium',
  })
  @Enum(() => TaskPriority)
  priority!: TaskPriority;

  @ApiProperty({
    description: 'User who owns the task',
    type: () => User,
  })
  @ManyToOne(() => User)
  user!: User;

  @ApiProperty({
    description: 'ISO timestamp when the task was created',
    example: '2025-01-01T10:00:00.000Z',
  })
  @Property()
  createdAt?: Date = new Date();

  @ApiProperty({
    description: 'ISO timestamp when the task was last updated',
    example: '2025-01-01T15:30:00.000Z',
  })
  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
