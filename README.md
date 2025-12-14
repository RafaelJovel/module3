# Configuration Service

A centralized configuration management service designed to provide flexible, secure, and scalable configuration storage for applications across the organization.

## Features

- RESTful API for managing application configurations
- Support for multiple application types (mobile, desktop, web, cloud services, microservices)
- MS SQL Server database with JSON storage for flexible configuration
- Comprehensive test coverage (unit and integration tests)
- OpenAPI/Swagger documentation

## Prerequisites

- .NET SDK >= 8.0
- MS SQL Server 2019 LocalDB (included with Visual Studio)
- Node.js >= 24 (for frontend, coming in future tasks)
- Make (optional, for task automation)

## Quick Start

### 1. Install Dependencies

```bash
cd svc && dotnet restore
cd svc.Tests && dotnet restore
```

### 2. Configure Database Connection

Copy the example configuration:
```bash
cd svc && copy appsettings.example.json appsettings.Development.json
```

The default connection string uses LocalDB:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=ConfigService;Trusted_Connection=true;"
  }
}
```

### 3. Create Database Schema

**Manual Setup (Required for now):**

Connect to your LocalDB instance using SQL Server Management Studio or Azure Data Studio and run:

```sql
CREATE DATABASE ConfigService;
GO

USE ConfigService;
GO

CREATE TABLE applications (
    id VARCHAR(26) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    description NVARCHAR(1000) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
```

### 4. Run the API

```bash
cd svc && dotnet run
```

The API will be available at: http://localhost:5000

Swagger documentation: http://localhost:5000/swagger

## Testing

### Run All Tests
```bash
cd svc.Tests && dotnet test
```

### Run Only Unit Tests
```bash
cd svc.Tests && dotnet test --filter "FullyQualifiedName~Controllers"
```

### Run Integration Tests
```bash
cd svc.Tests && dotnet test --filter "FullyQualifiedName~Integration"
```

**Note:** Integration tests require the database schema to be created first.

## API Endpoints

### Applications

- `GET /api/v1/applications` - List all applications
- `GET /health` - Health check endpoint

## Project Structure

```
project/
├── svc/                          # Backend API service
│   ├── Controllers/              # API controllers
│   ├── Models/                   # Domain models and DTOs
│   ├── Repositories/             # Data access layer
│   ├── Migrations/               # Database migrations
│   └── Program.cs                # Application entry point
├── svc.Tests/                    # Test project
│   ├── Controllers/              # Unit tests for controllers
│   └── Integration/              # Integration tests
├── changes/                      # Work item tracking
├── memory/                       # Project documentation
├── Makefile                      # Development task automation
└── README.md                     # This file
```

## Development Commands

### Build
```bash
cd svc && dotnet build
```

### Format Code
```bash
cd svc && dotnet format
```

### Run Linting
```bash
cd svc && dotnet build /p:EnforceCodeStyleInBuild=true
```

## Technology Stack

- **Backend**: ASP.NET Core 8.0
- **Database**: MS SQL Server 2019 with JSON support
- **ORM**: Dapper (micro-ORM)
- **Validation**: FluentValidation
- **IDs**: ULID (Universally Unique Lexicographically Sortable Identifier)
- **Testing**: xUnit, Moq, FluentAssertions
- **API Docs**: Swashbuckle (OpenAPI/Swagger)

## Current Status

### Completed
✅ Task 1: Backend - List Applications Endpoint
- GET /api/v1/applications endpoint implemented
- Repository pattern with Dapper
- Comprehensive unit tests (3/3 passing)
- Integration tests ready (require manual DB setup)
- OpenAPI documentation

### Upcoming
⏳ Task 2: Frontend - Application List Display
⏳ Task 3: Frontend - Empty State Handling

## Troubleshooting

### LocalDB Connection Issues
If you can't connect to LocalDB, ensure:
1. SQL Server LocalDB is installed
2. The LocalDB instance is running: `sqllocaldb start MSSQLLocalDB`
3. Create the instance if needed: `sqllocaldb create MSSQLLocalDB`

### Migration Tool Issues
The FluentMigrator CLI tool has dependency conflicts. Use the manual SQL script above to create the schema. Automated migrations will be addressed in future improvements.

## Contributing

Follow the development workflow defined in `memory/WORKFLOW_STATUS.md`:
1. PLAN - Define test strategy and file changes
2. BUILD & ASSESS - Implement with quality validation
3. REFLECT & ADAPT - Review and improve process
4. COMMIT & PICK NEXT - Commit and select next task

## License

Internal use only.
