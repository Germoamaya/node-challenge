import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Logger } from '@nestjs/common';
import chalk from 'chalk';

import { UserSeeder } from './user.seeder';

export class DatabaseSeeder extends Seeder {
  public logger = new Logger('DatabaseSeeder');

  async run(em: EntityManager): Promise<void> {
    const seeders = [UserSeeder];

    this.logger.log(
      `Seeding database with seeders: ${chalk.green(seeders.map((s) => s.name).join(', '))}`,
    );
    this.logger.log(`Default user password: ${chalk.green('password123')}`);

    return this.call(em, seeders);
  }
}
