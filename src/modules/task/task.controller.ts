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
  Request,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dtos';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId;
    return this.taskService.findAll(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const userId = req.user.userId;
    return this.taskService.create(createTaskDto, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Request() req) {
    const userId = req.user.userId;
    return this.taskService.findOne(userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.taskService.update(userId, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: number, @Request() req) {
    const userId = req.user.userId;
    return this.taskService.delete(userId);
  }

  @Get('populate')
  populate() {
    // This will be implemented later for external API integration
    return { message: 'Populate endpoint - coming soon!' };
  }
}
