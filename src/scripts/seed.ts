import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MikroORM } from '@mikro-orm/core';
import { DatabaseSeeder } from '../database/seeders/database.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const orm = app.get(MikroORM);
    const generator = orm.getSchemaGenerator();

    // Ensure database schema is up to date
    await generator.updateSchema();

    // Run seeding using MikroORM seeder
    const seeder = orm.getSeeder();
    await seeder.seed(DatabaseSeeder);
  } catch (error) {
    process.stderr.write(`Error during seeding: ${error}\n`);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
