import { Controller, Get } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from './entities/user.entity';
import { MikroORM } from '@mikro-orm/core';
@Controller()
export class AppController {
  constructor(
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World!!!!!';
  }

  @Get('db-test')
  async testDatabase() {
    try {
      const result = await this.em.getConnection().execute('SELECT 1 as test');
      return { status: 'Database connected!', result };
    } catch (error) {
      return { status: 'Database error', error: error.message };
    }
  }

  @Get('create-user')
  async createUser() {
    try {
      const user = this.em.create(User, {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        idx: 'admin-user-id',
      });
      await this.em.persistAndFlush(user);
      return { status: 'User created!', user };
    } catch (error) {
      return { status: 'Error creating user', error: error.message };
    }
  }

  @Get('create-schema')
  async testDatabaseMikro() {
    try {
      const result = await this.orm.getSchemaGenerator().createSchema();
      return { status: 'Table created successfully', result };
    } catch (error) {
      return { status: 'Error creating table', error: error.message };
    }
  }
}
