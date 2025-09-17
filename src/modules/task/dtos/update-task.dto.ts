import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({
    description: 'Whether the task is completed',
    example: true,
  })
  @IsBoolean()
  completed: boolean;
}
