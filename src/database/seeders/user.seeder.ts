import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Logger } from '@nestjs/common';
import { User } from '../../entities';
import { Role } from '../../common/enums';
import * as argon2 from 'argon2';

export class UserSeeder extends Seeder {
  public logger = new Logger('UserSeeder');

  async run(em: EntityManager): Promise<void> {
    this.logger.log('🌱 Starting user seeding...');

    // Check if users already exist
    const existingUsers = await em.count(User);
    if (existingUsers > 0) {
      this.logger.log(
        `✅ Users already exist (${existingUsers} found). Skipping seeding.`,
      );
      return;
    }

    const hashedPassword = await argon2.hash('password123');

    // Create 10 regular users
    const users = Array.from({ length: 10 }, (_, i) =>
      em.create(User, {
        id: i + 1,
        username: `user${i + 1}`,
        password: hashedPassword,
        roles: [Role.USER],
      }),
    );

    const adminPassword = await argon2.hash('password');

    // Create admin user
    const adminUser = em.create(User, {
      id: 11,
      username: 'admin',
      password: adminPassword,
      roles: [Role.USER, Role.ADMIN],
    });

    users.push(adminUser);

    em.persist(users);
    await em.flush();

    this.logger.log(
      `✅ Successfully created ${users.length} users (10 regular + 1 admin)`,
    );
  }
}
