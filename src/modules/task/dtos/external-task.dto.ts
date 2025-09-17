import { ApiProperty } from '@nestjs/swagger';

export class ExternalTaskDto {
  @ApiProperty({
    description: 'User ID from external API',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Task ID from external API',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Title of the task from external API',
    example: 'delectus aut autem',
  })
  title: string;

  @ApiProperty({
    description: 'Completion status from external API',
    example: false,
  })
  completed: boolean;
}
