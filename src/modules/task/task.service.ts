import { Task, User } from '../../entities';
import { Role, TaskPriority } from '../../common/enums';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateTaskDto, UpdateTaskDto } from './dtos';
import { ExternalTaskDto } from './dtos/external-task.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TaskService {
  constructor(
    private readonly em: EntityManager,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(userId: number): Promise<Task[]> {
    return this.em.find(Task, { user: userId });
  }

  async findOne(id: number, userId: number): Promise<Task> {
    return this.em.findOneOrFail(Task, { id, user: userId });
  }

  async create(dto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.em.create(Task, {
      ...dto,
      user: this.em.getReference(User, userId),
      completed: false,
      description: dto.description || '',
    });
    await this.em.persistAndFlush(task);
    this.eventEmitter.emit('TASK_CREATED', task);
    return task;
  }

  async update(id: number, dto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.em.findOneOrFail(Task, { id, user: userId });
    const wasCompleted = task.completed;

    task.completed = dto.completed;
    await this.em.persistAndFlush(task);

    if (dto.completed && !wasCompleted) {
      this.eventEmitter.emit('TASK_COMPLETED', task);
    }
    return task;
  }

  async delete(
    id: number,
    userId: number,
    userRoles?: string[],
  ): Promise<void> {
    // If user has admin role, they can delete any task
    if (userRoles?.includes(Role.ADMIN)) {
      const task = await this.em.findOneOrFail(Task, { id });
      await this.em.removeAndFlush(task);
    } else {
      // Regular users can only delete their own tasks
      const task = await this.em.findOneOrFail(Task, { id, user: userId });
      await this.em.removeAndFlush(task);
    }
  }

  async populateFromExternalApi(): Promise<{
    message: string;
    imported: number;
    skipped: number;
  }> {
    try {
      // Fetch data from external API
      const response = await firstValueFrom(
        this.httpService.get<ExternalTaskDto[]>(
          'https://jsonplaceholder.typicode.com/todos',
        ),
      );

      const externalTasks = response.data;
      let imported = 0;
      let skipped = 0;

      for (const externalTask of externalTasks) {
        // Check if task already exists (by title)
        const existingTask = await this.em.findOne(Task, {
          title: externalTask.title,
        });

        if (existingTask) {
          skipped++;
          continue;
        }

        // Find existing user for this task
        const user = await this.em.findOne(User, { id: externalTask.userId });
        if (!user) {
          console.warn(
            `User with ID ${externalTask.userId} not found. Skipping task ${externalTask.id}`,
          );
          skipped++;
          continue;
        }

        // Create task from external data
        const task = this.em.create(Task, {
          title: externalTask.title,
          description: `External task ID: ${externalTask.id}`, // Store external ID in description
          completed: externalTask.completed,
          priority: TaskPriority.MEDIUM, // Default priority for external tasks
          user: user,
        });

        await this.em.persistAndFlush(task);
        this.eventEmitter.emit('TASK_CREATED', task);
        imported++;
      }

      return {
        message: 'External tasks populated successfully',
        imported,
        skipped,
      };
    } catch (error) {
      throw new Error(`Failed to populate from external API: ${error.message}`);
    }
  }
}
