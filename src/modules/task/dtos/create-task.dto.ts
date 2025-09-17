import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '../../../common/enums';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Complete project documentation',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Write comprehensive API documentation with examples',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Priority level of the task',
    enum: ['low', 'medium', 'high'],
    example: 'medium',
  })
  @IsEnum(TaskPriority)
  priority: TaskPriority;
}
