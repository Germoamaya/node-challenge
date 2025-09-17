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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
  ApiExtraModels,
} from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dtos';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { PaginatedResponse } from '../../common/dtos/paginated-response.dto';
import { Task } from '../../entities/task.entity';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    roles: string[];
  };
}

@ApiTags('tasks')
@ApiBearerAuth()
@ApiExtraModels(PaginatedResponse, Task)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'List my tasks',
    description:
      'Returns tasks for the authenticated user with optional filters and pagination.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['low', 'medium', 'high'],
    description: 'Filter tasks by priority level',
  })
  @ApiQuery({
    name: 'completed',
    required: false,
    type: Boolean,
    description: 'Filter tasks by completion status',
  })
  @ApiOkResponse({
    description: 'List of tasks retrieved successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/PaginatedResponse' },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Task' },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: TaskQueryDto,
  ) {
    const userId = req.user.userId;
    return await this.taskService.findAll(userId, query);
  }

  @Get('populate')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Populate tasks from JSONPlaceholder (dedup + batch insert)',
    description:
      'Imports tasks from external API, skipping duplicates based on (user,title) unique key',
  })
  @ApiOkResponse({
    description: 'Import summary',
    schema: {
      properties: {
        imported: { type: 'number', example: 40 },
        skipped: { type: 'number', example: 60 },
        reason: {
          type: 'string',
          example: 'Duplicates skipped by (user,title) unique key',
        },
      },
    },
  })
  async populate() {
    return this.taskService.populateFromExternalApi();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create task' })
  @ApiBody({
    type: CreateTaskDto,
    examples: {
      minimal: {
        summary: 'Minimal task',
        value: { title: 'Ship MVP', priority: 'medium' },
      },
      withDescription: {
        summary: 'Task with description',
        value: {
          title: 'Write docs',
          description: 'Add Swagger documentation',
          priority: 'high',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: Task,
    description: 'Task created successfully',
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.taskService.create(createTaskDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by id' })
  @ApiParam({ name: 'id', description: 'Task ID', example: 1 })
  @ApiOkResponse({
    type: Task,
    description: 'Task retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Task not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    return this.taskService.findOne(taskId, userId);
  }

  @Patch(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: 1 })
  @ApiBody({
    type: UpdateTaskDto,
    examples: {
      complete: {
        summary: 'Mark as complete',
        value: { completed: true },
      },
      reprioritize: {
        summary: 'Change priority',
        value: { priority: 'low' },
      },
    },
  })
  @ApiOkResponse({
    type: Task,
    description: 'Task updated successfully',
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'Task not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: AuthenticatedRequest,
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
  @ApiOperation({ summary: 'Delete task (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Task ID', example: 1 })
  @ApiOkResponse({ description: 'Task deleted successfully' })
  @ApiNotFoundResponse({ description: 'Task not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    return this.taskService.delete(taskId, userId, userRoles);
  }
}
