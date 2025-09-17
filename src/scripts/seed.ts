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
    console.log('Updating database schema...');
    await generator.updateSchema();

    // Run seeding using MikroORM seeder
    const seeder = orm.getSeeder();
    await seeder.seed(DatabaseSeeder);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
