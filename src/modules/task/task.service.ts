import { firstValueFrom } from 'rxjs';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Task, User } from '../../entities';
import { CacheOperation } from '../../common/enums';
import { Role, TaskPriority } from '../../common/enums';
import { CreateTaskDto, UpdateTaskDto } from './dtos';
import { ExternalTaskDto } from './dtos/external-task.dto';
interface CacheManager {
  get(key: string): Promise<any>;
  set(key: string, value: Task[], ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

@Injectable()
export class TaskService {
  constructor(
    private readonly em: EntityManager,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: CacheManager,
  ) {}

  private async updateTaskCache(
    operation: CacheOperation,
    task: Task,
    userId: number,
  ): Promise<void> {
    const cacheKey = `tasks:${userId}`;
    const cachedTasks: Task[] = await this.cacheManager.get(cacheKey);
    if (!cachedTasks) return;

    switch (operation) {
      case CacheOperation.ADD:
        {
          cachedTasks.push(task);
          await this.cacheManager.set(cacheKey, cachedTasks, 600000);
        }
        break;

      case CacheOperation.UPDATE:
        {
          const taskIndex = cachedTasks.findIndex((t) => t.id === task.id);
          if (taskIndex !== -1) {
            cachedTasks[taskIndex] = task;
            await this.cacheManager.set(cacheKey, cachedTasks, 600000);
          }
        }
        break;

      case CacheOperation.DELETE: {
        const filteredTasks: Task[] = cachedTasks.filter(
          (t) => t.id !== task.id,
        );
        await this.cacheManager.set(cacheKey, filteredTasks, 600000);
        break;
      }
    }
  }

  async findAll(userId: number): Promise<Task[]> {
    const cacheKey = `tasks:${userId}`;
    const cachedTasks = await this.cacheManager.get(cacheKey);
    if (cachedTasks) {
      return cachedTasks;
    }

    const tasks = await this.em.find(Task, { user: userId });

    await this.cacheManager.set(cacheKey, tasks, 600000);

    return tasks;
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const cacheKey = `tasks:${userId}`;
    const cachedTasks: Task[] = await this.cacheManager.get(cacheKey);
    if (cachedTasks) {
      const task = cachedTasks.find((t) => t.id === id);
      if (task) {
        return task;
      }
    }

    const task = await this.em.findOneOrFail(Task, { id, user: userId });
    await this.updateTaskCache(CacheOperation.ADD, task, userId);
    return task;
  }

  async create(dto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.em.create(Task, {
      ...dto,
      user: this.em.getReference(User, userId),
      completed: false,
      description: dto.description || '',
    });

    await this.em.persistAndFlush(task);
    await this.updateTaskCache(CacheOperation.ADD, task, userId);
    this.eventEmitter.emit('TASK_CREATED', task);
    return task;
  }

  async update(id: number, dto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.em.findOneOrFail(Task, { id, user: userId });
    const wasCompleted = task.completed;

    task.completed = dto.completed;
    await this.em.persistAndFlush(task);
    await this.updateTaskCache(CacheOperation.UPDATE, task, userId);
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
    // Admin can delete any task, regular users can only delete their own
    const query = userRoles?.includes(Role.ADMIN)
      ? { id }
      : { id, user: userId };
    const task = await this.em.findOneOrFail(Task, query);
    await this.em.removeAndFlush(task);
    await this.updateTaskCache(CacheOperation.DELETE, task, task.user.id);
  }

  async populateFromExternalApi(): Promise<{
    message: string;
    imported: number;
    skipped: number;
  }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ExternalTaskDto[]>(
          'https://jsonplaceholder.typicode.com/todos',
        ),
      );

      const externalTasks = response.data;
      let imported = 0;
      let skipped = 0;

      for (const externalTask of externalTasks) {
        const existingTask = await this.em.findOne(Task, {
          title: externalTask.title,
        });

        if (existingTask) {
          skipped++;
          continue;
        }

        const user = await this.em.findOne(User, { id: externalTask.userId });
        if (!user) {
          console.warn(
            `User with ID ${externalTask.userId} not found. Skipping task ${externalTask.id}`,
          );
          skipped++;
          continue;
        }

        const task = this.em.create(Task, {
          title: externalTask.title,
          description: `External task ID: ${externalTask.id}`,
          completed: externalTask.completed,
          priority: TaskPriority.MEDIUM,
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
      throw new Error(
        `Failed to populate from external API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
