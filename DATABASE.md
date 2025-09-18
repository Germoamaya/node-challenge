# Database Management Guide

This guide explains how the database initialization and management works in this NestJS project.

## How Database Initialization Works

### Automatic Initialization

When the application starts, the `DatabaseInitService` automatically:

1. **Connects to PostgreSQL** - Verifies database connection
2. **Creates Database** - Ensures the database exists (if it doesn't, creates it)
3. **Updates Schema** - Creates/updates tables based on your entities
4. **Runs Migrations** - Executes any pending migrations
5. **Seeds Data** - Runs seeders if the database is empty

### What Happens on First Run

```bash
# When you start the app for the first time:
🚀 Database initialization...
✅ Database connection established
✅ Database ensured
✅ Database schema updated
✅ Migrations executed
🌱 Database is empty, running seeders...
✅ Database seeding completed
✅ Database initialization completed successfully
```

### What Happens on Subsequent Runs

```bash
# When you restart the app:
🚀 Database initialization...
✅ Database connection established
✅ Database ensured
✅ Database schema updated
✅ Migrations executed
ℹ️ Database already has data, skipping seeding
✅ Database initialization completed successfully
```

## Database Scripts

### Available Commands

```bash
# Schema Management
npm run schema:create    # Create database schema
npm run schema:update    # Update schema to match entities
npm run schema:drop      # Drop entire schema (DANGER!)

# Migration Management
npm run migration:create # Create a new migration file
npm run migration:up     # Run pending migrations
npm run migration:down   # Rollback last migration
npm run migration:pending # Show pending migrations

# Data Seeding
npm run seed            # Run seeders manually
```

## How to Add New Tables/Fields

### 1. Modify Your Entity

```typescript
// src/entities/your-entity.entity.ts
@Entity()
export class YourEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  newField!: string; // Add new field

  // ... other fields
}
```

### 2. Generate Migration

```bash
npm run migration:create
# This creates: src/database/migrations/20240101120000-AddNewField.ts
```

### 3. Review and Run Migration

```bash
# Check what will be changed
npm run migration:pending

# Apply the migration
npm run migration:up
```

## Docker Database Setup

### First Time Setup

```bash
# Start all services
docker-compose up -d

# Check if database is initialized
docker-compose logs app | grep "Database initialization"
```

### Reset Database (Development Only)

```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Environment Variables

### Required Database Variables

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskdb
DB_USER=postgres
DB_PASSWORD=password

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# API Key
API_KEY=your-api-key
```

### Docker Environment

The `docker-compose.yml` automatically sets these variables:

- Database host: `postgres` (Docker service name)
- Redis URL: `redis://redis:6379`
- All secrets are pre-configured for development

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection manually
docker-compose exec postgres psql -U postgres -d taskdb -c "SELECT 1;"
```

### Schema Issues

```bash
# Check current schema
npm run schema:update --dry-run

# Force recreate schema (DANGER: loses data)
npm run schema:drop
npm run schema:create
```

### Migration Issues

```bash
# Check migration status
npm run migration:pending

# Rollback problematic migration
npm run migration:down

# Check migration files
ls src/database/migrations/
```

### Seeding Issues

```bash
# Run seeders manually
npm run seed

# Check seeder files
ls src/database/seeders/
```

## Production Considerations

### 1. Migration Strategy

- Always test migrations on staging first
- Use `--dry-run` to preview changes
- Have rollback plans ready
- Consider zero-downtime migrations for large tables

### 2. Backup Strategy

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres taskdb > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres taskdb < backup.sql
```

### 3. Monitoring

- Monitor database connection health via `/health` endpoint
- Set up alerts for failed migrations
- Monitor database performance metrics

### 4. Security

- Change default passwords in production
- Use environment-specific secrets
- Enable SSL for database connections
- Restrict database access to application only

## Development Workflow

### Adding New Features

1. Create/modify entity classes
2. Generate migration: `npm run migration:create`
3. Review generated migration file
4. Test migration: `npm run migration:up`
5. Add seed data if needed
6. Test your changes

### Database Reset (Development)

```bash
# Quick reset
docker-compose down -v && docker-compose up -d

# Or manual reset
npm run schema:drop
npm run schema:create
npm run seed
```

This setup ensures your database is always in the correct state when the application starts, whether it's a fresh installation or an update with new migrations.
