import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dtos';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAll() {
    // For now, using hardcoded userId - we'll add auth later
    const userId = 1;
    return this.taskService.findAll(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto) {
    // For now, using hardcoded userId - we'll add auth later
    const userId = 1;
    return this.taskService.create(createTaskDto, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: number) {
    return this.taskService.delete(id);
  }

  @Get('populate')
  populate() {
    // This will be implemented later for external API integration
    return { message: 'Populate endpoint - coming soon!' };
  }
}
