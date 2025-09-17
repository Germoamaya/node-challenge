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
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dtos';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId;
    return this.taskService.findAll(userId);
  }

  @Get('populate')
  @UseGuards(ApiKeyGuard) // Temporarily disabled for testing
  async populate() {
    return this.taskService.populateFromExternalApi();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const userId = req.user.userId;
    return this.taskService.create(createTaskDto, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    return this.taskService.findOne(taskId, userId);
  }

  @Patch(':id')
  @Roles(Role.USER)
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    return this.taskService.update(taskId, updateTaskDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.USER, Role.ADMIN)
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    return this.taskService.delete(taskId, userId, userRoles);
  }
}
