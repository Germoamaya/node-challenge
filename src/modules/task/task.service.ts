import { firstValueFrom } from 'rxjs';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Task, User } from '../../entities';
import { Role, TaskPriority } from '../../common/enums';
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from './dtos';
import { ExternalTaskDto } from './dtos/external-task.dto';
interface CacheManager {
  get<T = any>(key: string): Promise<T | undefined>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
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

  private buildListKey(userId: number, q: Partial<TaskQueryDto>) {
    const p = q.priority ?? 'all';
    const c = typeof q.completed === 'boolean' ? String(q.completed) : 'any';
    const page = q.page ?? 1;
    const limit = q.limit ?? 5;
    return `tasks:${userId}:p=${p}:c=${c}:page=${page}:limit=${limit}`;
  }

  private indexKey(userId: number) {
    return `tasks:index:${userId}`; // stores all list-keys for this user
  }

  private async invalidateUserLists(userId: number) {
    const idxKey = this.indexKey(userId);
    const keys: string[] = (await this.cacheManager.get(idxKey)) || [];
    if (keys.length) {
      await Promise.all(keys.map((k) => this.cacheManager.del(k)));
    }
    await this.cacheManager.del(idxKey);
  }

  async findAll(userId: number, query: TaskQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 5;
    const offset = (page - 1) * limit;

    const where: any = { user: userId };
    if (query.priority) where.priority = query.priority;
    if (typeof query.completed === 'boolean') where.completed = query.completed;

    const cacheKey = this.buildListKey(userId, query);
    const cached = await this.cacheManager.get<{
      data: Task[];
      page: number;
      limit: number;
      total: number;
    }>(cacheKey);
    if (cached) return cached;

    const [data, total] = await this.em.findAndCount(Task, where, {
      limit,
      offset,
      orderBy: { createdAt: 'desc' },
    });

    const response = { data, page, limit, total };
    await this.cacheManager.set(cacheKey, response, 600_000);
    return response;
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
    await this.invalidateUserLists(userId);
    this.eventEmitter.emit('TASK_CREATED', task);
    return task;
  }

  async update(id: number, dto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.em.findOneOrFail(Task, { id, user: userId });
    const wasCompleted = task.completed;

    if (dto.completed !== undefined) task.completed = dto.completed;

    await this.em.persistAndFlush(task);
    await this.invalidateUserLists(userId);

    if (dto.completed && !wasCompleted)
      this.eventEmitter.emit('TASK_COMPLETED', task);
    return task;
  }

  async delete(
    id: number,
    userId: number,
    userRoles?: string[],
  ): Promise<void> {
    const query = userRoles?.includes(Role.ADMIN)
      ? { id }
      : { id, user: userId };
    const task = await this.em.findOneOrFail(Task, query);
    await this.em.removeAndFlush(task);
    await this.invalidateUserLists(task.user.id);
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
