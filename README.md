# Task Management API / API de Gestión de Tareas

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)](https://nestjs.com/)
[![MikroORM](https://img.shields.io/badge/MikroORM-6.5.3-blue.svg)](https://mikro-orm.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-green.svg)](https://postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-orange.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://docker.com/)

A comprehensive task management API built with NestJS, featuring JWT authentication, role-based access control, Redis caching, and external API integration.

Una API completa de gestión de tareas construida con NestJS, que incluye autenticación JWT, control de acceso basado en roles, caché Redis e integración con API externa.

---

## 🚀 Quick Start / Inicio Rápido

### Prerequisites / Prerrequisitos

- [Docker](https://www.docker.com/products/docker-desktop) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.0+)
- [Node.js](https://nodejs.org/) (v18+) - for local development
- [npm](https://www.npmjs.com/) (v8+) - for local development

### 🐳 Docker Setup (Recommended / Recomendado)

1. **Clone the repository / Clona el repositorio**

   ```bash
   git clone <repository-url>
   cd node-challenge
   ```

2. **Start all services / Inicia todos los servicios**

   ```bash
   docker-compose up -d
   ```

3. **Wait for initialization / Espera la inicialización**

   ```bash
   # Check logs / Verifica los logs
   docker-compose logs -f app

   # Wait for this message / Espera este mensaje
   # ✅ Database initialization completed successfully
   ```

4. **Test the API / Prueba la API**

   ```bash
   # Health check / Verificación de salud
   curl http://localhost:3000/health

   # API Documentation / Documentación de la API
   # Open in browser / Abre en el navegador
   http://localhost:3000/docs
   ```

---

## 📚 API Documentation / Documentación de la API

### Base URL / URL Base

```
http://localhost:3000
```

### Swagger UI / Interfaz Swagger

```
http://localhost:3000/docs
```

### Authentication / Autenticación

The API uses JWT tokens for authentication. Include the access token in the Authorization header:

La API usa tokens JWT para autenticación. Incluye el token de acceso en el header Authorization:

```bash
Authorization: Bearer <your-access-token>
```

### Available Endpoints / Endpoints Disponibles

#### 🔐 Authentication / Autenticación

| Method | Endpoint         | Description                  | Auth Required |
| ------ | ---------------- | ---------------------------- | ------------- |
| POST   | `/auth/login`    | Login with username/password | ❌            |
| POST   | `/auth/refresh`  | Refresh access token         | ❌            |
| POST   | `/auth/register` | Register new user            | ❌            |

#### 📋 Tasks / Tareas

| Method | Endpoint          | Description                                   | Auth Required |
| ------ | ----------------- | --------------------------------------------- | ------------- |
| GET    | `/tasks`          | List user's tasks (with pagination & filters) | ✅            |
| POST   | `/tasks`          | Create new task                               | ✅            |
| GET    | `/tasks/:id`      | Get task by ID                                | ✅            |
| PATCH  | `/tasks/:id`      | Update task                                   | ✅            |
| DELETE | `/tasks/:id`      | Delete task                                   | ✅            |
| GET    | `/tasks/populate` | Import tasks from external API                | 🔑 API Key    |

#### 🔧 System / Sistema

| Method | Endpoint  | Description  | Auth Required |
| ------ | --------- | ------------ | ------------- |
| GET    | `/health` | Health check | ❌            |

---

## 🧪 Testing the API / Probando la API

### 1. Login / Iniciar Sesión

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

**Response / Respuesta:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 11,
    "username": "admin"
  }
}
```

### 2. Create a Task / Crear una Tarea

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high"
  }'
```

### 3. List Tasks / Listar Tareas

```bash
# Basic list / Lista básica
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer <your-access-token>"

# With pagination and filters / Con paginación y filtros
curl -X GET "http://localhost:3000/tasks?page=1&limit=10&priority=high&completed=false" \
  -H "Authorization: Bearer <your-access-token>"
```

### 4. Import External Tasks / Importar Tareas Externas

```bash
curl -X GET http://localhost:3000/tasks/populate \
  -H "x-api-key: populate-api-key"
```

---

## 🏗️ Architecture / Arquitectura

### Tech Stack / Stack Tecnológico

- **Framework**: NestJS 11
- **Database**: PostgreSQL 15 with MikroORM
- **Cache**: Redis 7
- **Authentication**: JWT with refresh tokens
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

### Project Structure / Estructura del Proyecto

```
src/
├── common/                 # Shared utilities / Utilidades compartidas
│   ├── decorators/        # Custom decorators / Decoradores personalizados
│   ├── dtos/             # Data Transfer Objects / Objetos de Transferencia
│   ├── enums/            # Enumerations / Enumeraciones
│   └── guards/           # Authentication guards / Guardias de autenticación
├── database/             # Database configuration / Configuración de BD
│   ├── migrations/       # Database migrations / Migraciones de BD
│   └── seeders/         # Database seeders / Sembradores de BD
├── entities/            # Database entities / Entidades de BD
├── modules/             # Feature modules / Módulos de funcionalidades
│   ├── auth/           # Authentication module / Módulo de autenticación
│   └── task/           # Task management module / Módulo de gestión de tareas
└── main.ts             # Application entry point / Punto de entrada
```

---

## 🔧 Configuration / Configuración

### Environment Variables / Variables de Entorno

| Variable             | Description                    | Default                  | Required |
| -------------------- | ------------------------------ | ------------------------ | -------- |
| `NODE_ENV`           | Environment                    | `development`            | ❌       |
| `PORT`               | Application port               | `3000`                   | ❌       |
| `DB_HOST`            | Database host                  | `localhost`              | ✅       |
| `DB_PORT`            | Database port                  | `5432`                   | ✅       |
| `DB_NAME`            | Database name                  | `taskdb`                 | ✅       |
| `DB_USER`            | Database user                  | `postgres`               | ✅       |
| `DB_PASSWORD`        | Database password              | -                        | ✅       |
| `REDIS_URL`          | Redis connection URL           | `redis://localhost:6379` | ✅       |
| `JWT_SECRET`         | JWT signing secret             | -                        | ✅       |
| `JWT_REFRESH_SECRET` | JWT refresh secret             | -                        | ✅       |
| `API_KEY`            | API key for external endpoints | -                        | ✅       |

### Default Users / Usuarios por Defecto

| Username | Password      | Role  | Description                    |
| -------- | ------------- | ----- | ------------------------------ |
| `admin`  | `password`    | ADMIN | Full access / Acceso completo  |
| `user1`  | `password123` | USER  | Regular user / Usuario regular |
| `user2`  | `password123` | USER  | Regular user / Usuario regular |
| ...      | ...           | ...   | ...                            |

---

## 🐳 Docker Services / Servicios Docker

### Services Overview / Resumen de Servicios

| Service           | Port | Description            |
| ----------------- | ---- | ---------------------- |
| `app`             | 3000 | NestJS API application |
| `postgres`        | 5433 | PostgreSQL database    |
| `redis`           | 6379 | Redis cache            |
| `redis-commander` | 8081 | Redis management UI    |

### Docker Commands / Comandos Docker

```bash
# Start all services / Iniciar todos los servicios
docker-compose up -d

# View logs / Ver logs
docker-compose logs -f app

# Stop all services / Detener todos los servicios
docker-compose down

# Stop and remove data / Detener y eliminar datos
docker-compose down -v

# Rebuild and start / Reconstruir e iniciar
docker-compose up --build -d

# Restart specific service / Reiniciar servicio específico
docker-compose restart app
```

---

## 🧪 Complete Workflow Example / Ejemplo de Flujo Completo

```bash
# 1. Login / Iniciar Sesión
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' | \
  jq -r '.accessToken')

# 2. Create Task / Crear Tarea
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Learn NestJS",
    "description": "Complete the NestJS tutorial",
    "priority": "high"
  }'

# 3. List Tasks / Listar Tareas
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer $TOKEN"

# 4. Update Task / Actualizar Tarea
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"completed": true}'

# 5. Delete Task / Eliminar Tarea
curl -X DELETE http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting / Solución de Problemas

### Common Issues / Problemas Comunes

#### 1. Port Conflicts / Conflictos de Puerto

```bash
# Check what's using the port / Verifica qué usa el puerto
netstat -tulpn | grep :3000

# Change port in docker-compose.yml / Cambia puerto en docker-compose.yml
ports:
  - "3001:3000"  # Use different host port / Usa puerto host diferente
```

#### 2. Database Connection Issues / Problemas de Conexión a BD

```bash
# Check PostgreSQL logs / Verifica logs de PostgreSQL
docker-compose logs postgres

# Verify database is healthy / Verifica que BD esté saludable
docker-compose ps postgres
```

#### 3. Build Failures / Fallos de Construcción

```bash
# Clean build / Construcción limpia
docker-compose build --no-cache app

# Check for TypeScript errors / Verifica errores de TypeScript
npm run build
```

---

**Happy coding! / ¡Feliz programación!** 🚀
