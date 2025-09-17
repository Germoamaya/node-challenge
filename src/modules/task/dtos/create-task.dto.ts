import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TaskPriority } from '../../../common/enums';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;
}
