# Docker Setup for Feature Selection Lab

This guide explains how to run the Feature Selection Lab application using Docker and Docker Compose.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 1.29+)

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and adjust if needed:

```bash
cp .env.example .env
```

The default values are already suitable for development. Customize `DB_USER`, `DB_PASSWORD`, and `DB_NAME` if desired.

### 2. Build and Run Containers

```bash
docker-compose up --build
```

This command will:
- Build the FastAPI backend image
- Build the React frontend image
- Create and start the PostgreSQL database
- Initialize all services

**First run may take several minutes as dependencies are installed and the database initializes.**

### 3. Access the Application

Once all services are healthy:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Database**: localhost:5432

## Services

### Database (PostgreSQL)
- **Container**: `feature-selection-db`
- **Port**: 5432
- **Credentials**: See `.env` file
- **Data Volume**: `postgres_data` (persisted between restarts)

### Backend (FastAPI)
- **Container**: `feature-selection-backend`
- **Port**: 8000
- **Features**: 
  - Hot-reload enabled (changes in code auto-reload)
  - scikit-learn for ML models
  - PostgreSQL integration with SQLAlchemy
- **Logs**: `docker logs feature-selection-backend`

### Frontend (React + Vite)
- **Container**: `feature-selection-frontend`
- **Port**: 80
- **Features**:
  - Served via Nginx
  - Proxies `/api/*` requests to backend
  - Tailwind CSS 4.3.0 for styling
  - Static content delivery optimized

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove All Data (including database)
```bash
docker-compose down -v
```

### Rebuild Images
```bash
docker-compose build --no-cache
```

### Access Backend Shell
```bash
docker-compose exec backend bash
```

### Access Database
```bash
docker-compose exec db psql -U fslab -d postgres
```

## Development Workflow

### Hot Reload (Backend)
The backend is configured with `--reload` flag. Changes to Python files in `./backend` will automatically reload the application.

### Frontend Changes
Since the frontend is built as a static image, you need to rebuild when making changes:

```bash
docker-compose down
docker-compose up --build
```

Or for development with hot-reload, you can run the frontend locally (without Docker):
```bash
cd frontend
npm install
npm run dev
```

Then update `vite.config.ts` to point the API proxy to the Docker backend:
```javascript
target: 'http://localhost:8000',
```

## Troubleshooting

### Database Connection Issues
Check if the database is healthy:
```bash
docker-compose ps
```

Wait for the `db` service to show as healthy before accessing the backend.

### Frontend Shows 502 Bad Gateway
- Ensure the backend container is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Restart services: `docker-compose restart`

### Port Already in Use
If ports 80, 8000, or 5432 are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "9000:8000"  # Changed from 8000:8000
```

### Clear Everything and Start Fresh
```bash
docker-compose down -v
rm -rf postgres_data
docker-compose up --build
```

## Production Considerations

This setup is optimized for development. For production:

1. **Environment Variables**: Use a secure `.env` file (never commit)
2. **Frontend Build**: Remove `--reload` flag from backend or use separate dev/prod configs
3. **Database**: Use managed database service (RDS, CloudSQL) instead of container
4. **SSL/TLS**: Add reverse proxy with SSL termination
5. **Logging**: Configure centralized logging
6. **Resource Limits**: Set memory and CPU limits in docker-compose.yml
7. **Health Checks**: Adjust based on your needs

## File Structure

```
.
├── docker-compose.yml        # Main orchestration file
├── .env.example              # Environment variables template
├── backend/
│   ├── Dockerfile            # Backend image definition
│   ├── .dockerignore         # Files to exclude from Docker build
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── Dockerfile            # Frontend image definition
│   ├── .dockerignore         # Files to exclude from Docker build
│   ├── nginx.conf            # Nginx configuration
│   └── package.json          # Node.js dependencies
```
