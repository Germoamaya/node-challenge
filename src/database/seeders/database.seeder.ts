import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Logger } from '@nestjs/common';

import { UserSeeder } from './user.seeder';

export class DatabaseSeeder extends Seeder {
  public logger = new Logger('DatabaseSeeder');

  async run(em: EntityManager): Promise<void> {
    const seeders = [UserSeeder];

    this.logger.log(
      `Seeding database with seeders: ${seeders.map((s) => s.name).join(', ')}`,
    );
    this.logger.log(`Default user password: password123`);

    return this.call(em, seeders);
  }
}
