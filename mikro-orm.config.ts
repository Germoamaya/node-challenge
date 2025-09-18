import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './src/database/mikro-orm.config';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Create a mock ConfigService for CLI usage
const configService = {
  get: (key: string) => process.env[key],
} as ConfigService;

export default getDatabaseConfig(configService);
