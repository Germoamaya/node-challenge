import { Controller, Get } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
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
