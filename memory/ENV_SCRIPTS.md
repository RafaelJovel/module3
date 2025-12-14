# Environments

The Configuration Service is designed to run in local development and production environments. All environments use the same MS SQL Server database schema, ASP.NET Core backend, and React frontend.

## Local Environment

### Prerequisites
- **.NET SDK**: >=8.0
- **Node.js**: >=24 with `npm` package manager
- **MS SQL Server 2019 LocalDB**: For local database development
- **Make**: For running project tasks

### Ports
- **API Service**: http://localhost:5000 (configurable via `ASPNETCORE_URLS` env var)
- **UI Development**: http://localhost:3000 (Vite dev server)
- **Database**: (localdb)\MSSQLLocalDB (LocalDB instance)

### Environment Setup

1. **Service Environment** (`svc/appsettings.Development.json`):
   ```bash
   cd svc && cp appsettings.example.json appsettings.Development.json
   ```

   Key variables:
   - `ConnectionStrings:DefaultConnection`: MS SQL Server connection string
   - `Logging:LogLevel`: Logging level configuration (Debug, Information, Warning, Error)
   - `Kestrel:Endpoints:Http:Url`: Server bind address and port

2. **Database Setup**:
   - LocalDB: Install MS SQL Server 2019 LocalDB (included with Visual Studio)
   - Connection string: `Server=(localdb)\\MSSQLLocalDB;Database=ConfigService;Trusted_Connection=true;`
   - Migrations: Apply via `dotnet ef database update` or Fluent Migrator CLI

3. **Dependencies**:
   - Backend: `dotnet restore` (restores NuGet packages)
   - Frontend: `npm install` (local node_modules)
   - Client Library: `cd ui/@config-client && npm install`

## Non-Local Environment

Currently configured for local development only. Production deployment patterns to be established based on organizational infrastructure requirements.

Recommended deployment approach:
- **Backend**: Containerized ASP.NET Core service with MS SQL Server database
- **Frontend**: Static file hosting (CDN or web server)
- **Database**: Managed MS SQL Server instance with connection pooling

## Environment-Specific Configs

### Debug Configuration
- **ASPNETCORE_ENVIRONMENT=Development**: Enables detailed error responses and debug logging
- **Logging:LogLevel**: Controls .NET logging verbosity
  - `Debug`: Verbose logging including SQL queries
  - `Information`: Standard operational logging (default)
  - `Warning`: Warnings and errors only
  - `Error`: Errors only

### Database Configuration
- **Connection Pooling**: ADO.NET automatic connection pooling
- **Migration Management**: Fluent Migrations for schema versioning
- **Health Checks**: Built-in database connectivity validation

### Frontend Configuration
- **Development**: Vite dev server with hot reload and API proxy
- **Production**: Static build output served from `dist/` directory
- **TypeScript**: Strict mode with comprehensive type checking

## Deployment Rules

### Local Development
- Database migrations applied via dotnet CLI or on startup
- No build step required for development (live reloading)
- Configuration loaded from `appsettings.Development.json`

### Production Deployment
- **Backend**:
  - Run database migrations before deployment: `make db-migrate` or `dotnet fm migrate`
  - Build and deploy ASP.NET Core container
  - Configure production connection strings and environment variables
- **Frontend**:
  - Build static assets: `make ui-build`
  - Deploy `ui/dist/` contents to static hosting
  - Configure API endpoint URLs for production backend

### CI/CD Pipeline Requirements
- Run full test suite: `make test`
- Code quality checks: `make format`, `make lint`, `cd ui && npm run type-check`
- Coverage validation: `make coverage-svc` (Backend >=80% required)
- Build validation: `make ui-build`

## Task Running

### IMPORTANT: Use Make Commands Only

**CRITICAL CONSISTENCY RULE**: All development tasks, verification processes, and regular operations MUST use Make commands. This ensures consistency across the entire development team and prevents configuration drift.

**When to use Make vs direct commands**:
- ✅ **ALWAYS Use Make For**: Development workflows, testing, building, deployment, code quality checks
- ⚠️  **Direct Commands Only For**: Specific troubleshooting, debugging individual components, one-off investigations

### Primary Task Runner: Make
All development tasks are orchestrated through the Makefile. Use `make help` to see all available commands:

```bash
make help          # Show available commands
make install       # Install all dependencies (svc + ui)
make test          # Run all tests (svc + ui)
make run-svc       # Start API server (localhost:5000)
make run-ui        # Start UI dev server (localhost:3000)
```

### Backend Tasks (Use Make Commands)
```bash
# Development workflow - USE THESE COMMANDS:
make run-svc       # Start development server
make test-svc      # Run backend tests (xUnit)
make db-migrate    # Apply database migrations (Fluent Migrations)
make db-reset      # Reset database (drop and recreate)
make format        # Code formatting with dotnet format
make lint          # Code linting with dotnet analyzer
make coverage-svc  # Tests with coverage analysis (>=80% required)
```

### Frontend Tasks (Use Make + npm)
```bash
# Development workflow - USE THESE COMMANDS:
make run-ui        # Start Vite dev server (port 3000)
make test-ui       # Run Jest tests
make ui-build      # Build for production (TypeScript + Vite)
make coverage-ui   # Tests with coverage analysis

# TypeScript validation (npm command - no Make equivalent yet):
cd ui && npm run type-check    # TypeScript validation
```

### Database Management
```bash
make db-migrate  # Apply pending migrations (Fluent Migrations)
make db-reset    # Drop and recreate all tables
```

### Complete Development Workflow Commands
```bash
# Setup and Installation
make install     # Install all dependencies (svc + ui)

# Development Servers
make run-svc     # Start API development server (port 5000)
make run-ui      # Start UI development server (port 3000)

# Testing and Verification (REQUIRED BEFORE COMMITS)
make test        # Run all tests (svc + ui)
make lint        # Run .NET linting checks
make format      # Format C# code with dotnet format
cd ui && npm run type-check  # TypeScript validation

# Coverage Analysis
make coverage-svc     # Backend test coverage (>=80% required)
make coverage-ui      # Frontend test coverage

# Database Operations
make db-migrate  # Apply database migrations
make db-reset    # Reset database (drop and recreate)

# Build and Deployment
make ui-build    # Build UI for production deployment

# Cleanup
make clean       # Remove generated files and caches
```

### Quick Verification Workflow
```bash
# Run this sequence before any commit:
make test && make lint && make format && cd ui && npm run type-check
```
