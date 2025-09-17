import { Controller, Get } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

@Controller()
export class AppController {
  constructor(private readonly orm: MikroORM) {}
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
