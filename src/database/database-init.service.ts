import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { DatabaseSeeder } from './seeders/database.seeder';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private readonly orm: MikroORM) {}

  async onModuleInit() {
    await this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      this.logger.log('Initializing database...');

      // Check if we can connect to the database
      await this.orm.isConnected();
      this.logger.log('Database connection established');

      // Create schema if it doesn't exist
      const generator = this.orm.getSchemaGenerator();
      await generator.ensureDatabase();
      this.logger.log('Database ensured');

      // Update schema to match entities
      await generator.updateSchema();
      this.logger.log('Database schema updated');

      // Run seeding if database is empty
      const em = this.orm.em.fork();
      const userCount = await em.count('User');

      if (userCount === 0) {
        this.logger.log('Database is empty, running seeders...');
        const seeder = this.orm.getSeeder();
        await seeder.seed(DatabaseSeeder);
        this.logger.log('Database seeding completed');
      } else {
        this.logger.log('Database already has data, skipping seeding');
      }

      this.logger.log('Database initialization completed successfully');
    } catch (error) {
      this.logger.error('Database initialization failed:', error);
      throw error;
    }
  }
}
