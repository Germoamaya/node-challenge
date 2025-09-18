#!/bin/bash

echo "🚀 Starting NestJS Task Management API initialization..."

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5433 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until redis-cli -h redis -p 6379 ping; do
  echo "Redis is unavailable - sleeping"
  sleep 2
done
echo "✅ Redis is ready!"

# Build the application
echo "🔨 Building application..."
npm run build

# Start the application
echo "🚀 Starting application..."
npm run start:prod
