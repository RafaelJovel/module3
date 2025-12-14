# Configuration Service Technical Implementation Details

## Technology Stack

### Backend (Service)
- **Language**: C# with .NET >=8.0
- **Framework**: ASP.NET Core
- **Database**: MS SQL Server 2019 LocalDB with JSON support
- **Database Access**: Dapper (micro-ORM with direct SQL)
- **Validation**: FluentValidation
- **Unique IDs**: Ulid-dotnet (Universally Unique Lexicographically Sortable Identifier)
- **API Documentation**: OpenAPI via Swashbuckle
- **Migrations**: Fluent Migrations
- **Testing**: xUnit

### Frontend (UI)
- **Language**: TypeScript
- **Framework**: React with hooks
- **Build Tool**: Vite
- **Testing**: Jest
- **State Management**: Local state (useState, useEffect) preferred over Redux

## Development Environment

### Prerequisites
- .NET SDK >=8.0
- Node.js >=24
- MS SQL Server 2019 LocalDB
- Make (optional, for task automation)

## Database Configuration

### Connection
- Connection pooling with ADO.NET (automatic)
- Async database operations using async/await
- Environment-based configuration via appsettings.json

### Schema
- Two primary tables: applications and configurations
- ULID primary keys (26 character string)
- NVARCHAR(MAX) with JSON for flexible configuration storage
- Automatic timestamp tracking (created_at, updated_at)
- Database migrations using Fluent Migrations

## API Design

### Endpoints
- RESTful API design
- JSON request/response format
- Versioned API paths (/api/v1/...)
- Comprehensive error handling
- Consistent response structure

### Authentication & Security
- Input validation using FluentValidation
- SQL injection protection via parameterized queries with Dapper
- Rate limiting (to be implemented)
- Authentication (to be implemented)

### Validation Constraints
- **Application Names**: 
  - Alphanumeric characters, underscores, and hyphens only (regex: `^[a-zA-Z0-9_\-]+$`)
  - 1-255 characters in length
  - Cannot be empty or whitespace-only
  - Must be unique across all applications
- **Application Descriptions**: 
  - Maximum 1000 characters
  - Optional field (can be null)
  - Empty strings converted to null
- **Configuration Data**: 
  - Must be valid JSON object (dictionary/map structure)
  - Cannot be empty
  - Maximum payload size: 1MB (1,048,576 bytes)
  - Stored as JSON in MS SQL Server for efficient querying
- **ULID Validation**: 
  - Exactly 26 characters in length
  - Base32 encoding using characters: 0-9, A-Z (excluding I, L, O, U)
  - Case-insensitive input, stored as uppercase
  - Lexicographically sortable by creation time
- **Database Constraints**: 
  - Foreign key relationships enforced with CASCADE delete
  - Automatic timestamp tracking (created_at, updated_at)
  - JSON validation and indexing for configuration queries

## Testing Strategy

### Testing Architecture
Our testing approach uses two distinct test categories with different mock policies:

#### Unit Tests
- **Purpose**: Test individual components in isolation with fast execution
- **Mock Policy**: Use mocks ONLY for I/O operations:
  - Database connections and queries
  - Network/HTTP requests
  - File system operations
  - External service calls
- **No Mocks For**: Pure logic, calculations, data transformations, or internal class dependencies
- **Design Principle**: If a class requires mocking for non-I/O operations, use dependency injection instead
- **Execution**: Run before every commit to ensure code quality

#### Integration Tests
- **Purpose**: Test real system interactions and end-to-end workflows
- **Mock Policy**: NO mocks - test against real systems:
  - Real MS SQL Server database instances
  - Actual file system operations
  - Real HTTP endpoints and API calls
  - Complete data flow validation
- **Setup**: Use test databases, temporary directories, and controlled environments
- **Execution**: Run before merging to main branch (slower execution acceptable)

### Backend Testing
- **Unit Tests**: xUnit with mocked I/O, real business logic
- **Integration Tests**: xUnit with real MS SQL Server, real file operations
- **Repository Tests**: Integration-level with database fixtures
- **Endpoint Tests**: WebApplicationFactory with real database
- **Migration Tests**: Real schema validation against test database

### Frontend Testing
- **Unit Tests**: Jest with mocked API calls, real component logic
- **Integration Tests**: Jest with real API endpoints when possible
- **Component Tests**: Real DOM interactions with React Testing Library, mocked external services
- **Accessibility Tests**: Real browser APIs and screen readers
- **End-to-end Tests**: Real API integration and user workflows

## Deployment

### Service Deployment
- Docker container deployment
- Configuration via appsettings.json and environment variables
- Health check endpoint for monitoring
- Database migration on startup or via CLI

### UI Deployment
- Static file hosting
- Build process: `npm run build`
- Output directory: `dist/`
- No server-side rendering required

## Performance Considerations

### Backend
- ADO.NET connection pooling for database efficiency
- Async/await database operations
- JSON indexing for query performance
- Lightweight SQL queries with Dapper

### Frontend
- React optimization with hooks and memoization
- Efficient Virtual DOM updates
- Component-scoped CSS modules
- Code splitting and lazy loading

## Development Workflow

### Code Organization
- Modular code structure
- Clear separation of concerns
- Repository pattern for data access
- Component-based UI architecture

### Version Control
- Feature branch workflow
- Pull request reviews
- Semantic versioning
- Conventional commits

### CI/CD
- Automated testing
- Linting and type checking
- Build validation
- Containerized deployment

## Coding Rules
When generating code (runtime AND tests), STRICTLY adhere to these rules. If any conflicts are encountered, as the user to disambiguate.

### Importing Packages
All package imports SHOULD be located at the top of the file in accordance with linting rules. When it is more practical to place them in functions (e.g. rare conditional import), place a comment at the top of the file with the package name.
