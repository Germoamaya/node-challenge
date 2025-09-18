import { Controller, Get } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly orm: MikroORM) {}

  @Public()
  @Get('health')
  async healthCheck() {
    try {
      // Check database connection
      await this.orm.em.getConnection().execute('SELECT 1');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
