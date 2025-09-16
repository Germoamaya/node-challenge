import { Task, User } from 'src/entities';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dtos';

@Injectable()
export class TaskService {
  constructor(private readonly em: EntityManager) {}

  async findAll(userId: number): Promise<Task[]> {
    return this.em.find(Task, { user: userId });
  }

  async findOne(id: number): Promise<Task> {
    return this.em.findOneOrFail(Task, { id });
  }

  async create(dto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.em.create(Task, {
      ...dto,
      user: this.em.getReference(User, userId),
      completed: false,
      description: dto.description || '',
    });
    await this.em.persistAndFlush(task);
    return task;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.em.findOneOrFail(Task, { id });
    task.completed = dto.completed;
    await this.em.persistAndFlush(task);
    return task;
  }

  async delete(id: number): Promise<void> {
    const task = await this.em.findOneOrFail(Task, { id });
    await this.em.removeAndFlush(task);
  }
}
