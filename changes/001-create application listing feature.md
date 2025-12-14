# Work Item 001: Create Application Listing Feature

## Story Details

> As a **system administrator**, I want **to be able to see all the applications that the Configuration Service caters for**, so that **I can manage the configurations for each one of those applications**

### Notes
Implement the API and UI to be able to see all the applications that have configuration files managed by the configuration service. Create integration and unit tests as necessary.

This is a fresh project start - we'll create the entire Configuration Service codebase from scratch with this feature as the foundation.

---

## Acceptance Criteria (Tasks)

### Task 1: Backend - List Applications Endpoint
**Given** the Configuration Service has an applications database table  
**When** a GET request is made to `/api/v1/applications`  
**Then** the API returns a JSON array of all applications with their id, name, and description

**Status**: 🔵 PLAN Stage (Current Task)

### Task 2: Frontend - Application List Display
**Given** the backend API provides an applications listing endpoint  
**When** the administrator opens the Configuration Service UI  
**Then** they see a list of all applications with their names and descriptions

**Status**: ⚪ Not Started

### Task 3: Frontend - Empty State Handling
**Given** there are no applications in the database  
**When** the administrator opens the Configuration Service UI  
**Then** they see a friendly empty state message

**Status**: ⚪ Not Started

---

## Current Task: Task 1 - Backend List Applications Endpoint

### Current Stage: 🔵 PLAN

---

## PLAN Stage Details

### Test Strategy

#### Unit Tests (with mocked database I/O)
1. **ApplicationRepository Tests**
   - `GetAllApplications_ReturnsEmptyList_WhenNoApplicationsExist`
   - `GetAllApplications_ReturnsApplicationList_WhenApplicationsExist`
   - `GetAllApplications_MapsDbRowsToModelsCorrectly`

2. **ApplicationsController Tests**
   - `GetApplications_Returns200_WithApplicationList`
   - `GetApplications_Returns200_WithEmptyArray_WhenNoApplications`
   - `GetApplications_Returns500_WhenRepositoryThrowsException`

3. **Validation Tests**
   - `ApplicationResponse_HasRequiredFields`
   - `ApplicationModel_ValidatesCorrectly`

#### Integration Tests (with real MS SQL Server)
1. **End-to-End Endpoint Tests**
   - `GET_Applications_ReturnsDataFromDatabase`
   - `GET_Applications_ReturnsEmptyArray_WhenDatabaseIsEmpty`
   - `GET_Applications_HandlesMultipleApplications`
   - `GET_Applications_OrdersByName`

2. **Database Tests**
   - `Migration_CreatesApplicationsTable_Successfully`
   - `ApplicationsTable_HasCorrectSchema`

### File Changes Needed

#### Backend Core Files (svc/)
- `svc/ConfigService.csproj` - Project file with dependencies (ASP.NET Core, Dapper, FluentValidation, Ulid-dotnet, Swashbuckle)
- `svc/Program.cs` - ASP.NET Core setup, DI configuration, Swagger
- `svc/appsettings.example.json` - Configuration template with connection string
- `svc/Models/Application.cs` - Application domain model (Id, Name, Description)
- `svc/Models/Responses/ApplicationResponse.cs` - DTO for API responses
- `svc/Models/Responses/ErrorResponse.cs` - Error response model
- `svc/Repositories/IApplicationRepository.cs` - Repository interface
- `svc/Repositories/ApplicationRepository.cs` - Dapper-based repository implementation
- `svc/Controllers/ApplicationsController.cs` - API controller with GET endpoint
- `svc/Migrations/001_CreateApplicationsTable.cs` - Fluent Migrations for schema

#### Backend Test Files (svc.Tests/)
- `svc.Tests/ConfigService.Tests.csproj` - Test project file (xUnit, Moq, FluentAssertions)
- `svc.Tests/Repositories/ApplicationRepositoryTests.cs` - Repository unit tests
- `svc.Tests/Controllers/ApplicationsControllerTests.cs` - Controller unit tests
- `svc.Tests/Integration/ApplicationsEndpointTests.cs` - Integration tests with WebApplicationFactory

#### Project Infrastructure
- `Makefile` - Development task automation (install, test, run, db commands)
- `.gitignore` - Ignore bin/, obj/, appsettings.Development.json, node_modules/
- `README.md` - Setup instructions and usage guide

#### Database Schema
```sql
CREATE TABLE applications (
    id VARCHAR(26) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    description NVARCHAR(1000) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
```

### Dependencies Required

**Backend (NuGet packages)**:
- `Microsoft.AspNetCore.App` (Framework)
- `Dapper` (2.1+) - Micro-ORM
- `Microsoft.Data.SqlClient` (5.2+) - SQL Server driver
- `Ulid` (1.3+) - ULID generation
- `FluentValidation.AspNetCore` (11.3+) - Validation
- `Swashbuckle.AspNetCore` (6.5+) - OpenAPI/Swagger
- `FluentMigrator` (5.1+) - Database migrations
- `FluentMigrator.Runner` (5.1+) - Migration runner

**Testing (NuGet packages)**:
- `xUnit` (2.6+) - Test framework
- `xUnit.runner.visualstudio` (2.5+) - Test runner
- `Moq` (4.20+) - Mocking framework
- `FluentAssertions` (6.12+) - Assertion library
- `Microsoft.AspNetCore.Mvc.Testing` (8.0+) - Integration testing

### Implementation Order
1. Create project structure and .csproj files
2. Implement database migration for applications table
3. Create domain models and DTOs
4. Implement repository interface and Dapper implementation with unit tests
5. Implement controller with unit tests
6. Set up integration test infrastructure
7. Implement end-to-end integration tests
8. Create Makefile with development commands
9. Test full workflow: migrate DB → run API → call endpoint

---

## BUILD & ASSESS Stage Details
*To be filled when entering this stage*

---

## REFLECT & ADAPT Stage Details
*To be filled when entering this stage*

---

## COMMIT & PICK NEXT Stage Details
*To be filled when entering this stage*
