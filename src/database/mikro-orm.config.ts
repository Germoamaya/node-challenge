import { Options } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): Options => {
  return defineConfig({
    driver: PostgreSqlDriver,
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    dbName: configService.get('DB_NAME'),
    user: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    debug: configService.get('NODE_ENV') === 'development',
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    ensureDatabase: true,
    schema: 'public',
    schemaGenerator: {
      disableForeignKeys: true,
    },
    migrations: {
      disableForeignKeys: true,
    },
    seeder: {
      path: 'src/database/seeders',
      defaultSeeder: 'DatabaseSeeder',
    },
  });
};
