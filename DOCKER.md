# Docker Setup Guide

This document explains the Docker configuration for the NestJS Task Management API.

## What is Docker?

Docker is a containerization platform that packages your application and its dependencies into lightweight, portable containers. Think of containers as isolated environments that include everything needed to run your application.

## Benefits of Docker

1. **Consistency**: Runs the same way on any machine (development, staging, production)
2. **Isolation**: Each service runs in its own container
3. **Easy Setup**: One command to start the entire application stack
4. **Scalability**: Easy to scale services independently
5. **Dependency Management**: Each service has its own dependencies

## Files Explained

### 1. Dockerfile

The `Dockerfile` defines how to build your NestJS application container:

```dockerfile
FROM node:18-alpine          # Base image with Node.js 18
WORKDIR /app                 # Set working directory
COPY package*.json ./        # Copy package files first (for caching)
RUN npm ci --only=production # Install production dependencies
COPY dist ./dist            # Copy built application
USER nestjs                 # Run as non-root user (security)
EXPOSE 3000                 # Expose port 3000
CMD ["node", "dist/main.js"] # Start command
```

**Key Features:**

- Uses Alpine Linux (smaller, more secure)
- Multi-stage caching for faster builds
- Non-root user for security
- Health check endpoint

### 2. docker-compose.yml

The `docker-compose.yml` orchestrates multiple services:

#### Services:

**App Service (`app`):**

- Your NestJS API
- Connects to PostgreSQL and Redis
- Environment variables for configuration
- Depends on database services being healthy

**PostgreSQL Service (`postgres`):**

- Database server
- Persistent data storage
- Health checks to ensure it's ready
- Port 5433 exposed

**Redis Service (`redis`):**

- Caching server
- Session storage
- Health checks
- Port 6379 exposed

**Redis Commander (`redis-commander`):**

- Web UI for Redis management
- Optional service for debugging
- Accessible at http://localhost:8081

#### Networks:

- Custom bridge network for secure service communication
- Services can communicate by name (e.g., `postgres`, `redis`)

#### Volumes:

- Persistent storage for database and Redis data
- Data survives container restarts

### 3. .dockerignore

Similar to `.gitignore`, this file excludes unnecessary files from the Docker build context:

- `node_modules` (will be installed fresh)
- Source files (only `dist` folder needed)
- Environment files
- Documentation files

## How to Use

### Prerequisites

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Build your application: `npm run build`

### Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Development Workflow

```bash
# Build and start
docker-compose up --build

# Rebuild only the app service
docker-compose build app
docker-compose up app

# View service status
docker-compose ps

# Access application
curl http://localhost:3000/health
```

### Environment Configuration

The `docker-compose.yml` includes environment variables:

```yaml
environment:
  - DB_HOST=postgres # Database host
  - DB_PORT=5433 # Database port
  - DB_NAME=taskdb # Database name
  - DB_USER=postgres # Database user
  - DB_PASSWORD=password # Database password
  - REDIS_URL=redis://redis:6379 # Redis connection
  - JWT_SECRET=your-secret # JWT signing secret
  - API_KEY=your-api-key # API key for external endpoints
```

**⚠️ Security Note**: Change default passwords and secrets in production!

### Health Checks

The application includes health checks:

- **App Health**: `GET http://localhost:3000/health`
- **Database**: Checks PostgreSQL connection
- **Redis**: Built-in Redis health check
- **Docker**: Automatic container health monitoring

### Data Persistence

Data is stored in Docker volumes:

- `postgres_data`: Database files
- `redis_data`: Redis cache data

To backup data:

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres taskdb > backup.sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U postgres taskdb < backup.sql
```

### Troubleshooting

**Common Issues:**

1. **Port already in use**:

   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   # Stop conflicting services
   ```

2. **Database connection failed**:

   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   # Verify database is healthy
   docker-compose ps
   ```

3. **Build failures**:

   ```bash
   # Clean build
   docker-compose build --no-cache app
   # Check for missing dependencies
   npm run build
   ```

4. **Permission issues**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Production Considerations

1. **Secrets Management**: Use Docker secrets or external secret management
2. **SSL/TLS**: Add reverse proxy (nginx) for HTTPS
3. **Monitoring**: Add logging and monitoring services
4. **Scaling**: Use Docker Swarm or Kubernetes for production
5. **Backups**: Implement automated backup strategies

### Useful Commands

```bash
# View all containers
docker ps -a

# View container logs
docker logs <container_name>

# Execute commands in container
docker-compose exec app sh
docker-compose exec postgres psql -U postgres -d taskdb

# Clean up unused resources
docker system prune -a

# View resource usage
docker stats
```

This Docker setup provides a complete, production-ready environment for your NestJS Task Management API with all required services (PostgreSQL, Redis) properly configured and networked together.
