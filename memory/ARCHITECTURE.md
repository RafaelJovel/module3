# Configuration Service Architecture

## Service Architecture

### System Overview
The Configuration Service is a centralized, flexible configuration management system designed to provide secure and scalable configuration storage for various application types including mobile, desktop, web applications, cloud services, and microservices.

### Core Components

#### API Layer
- **Framework**: ASP.NET Core
- **API Design**: RESTful HTTP API with versioned endpoints (/api/v1)
- **Documentation**: OpenAPI documentation via Swashbuckle
- **Health Monitoring**: Dedicated health check endpoint

#### Database Layer
- **Database**: MS SQL Server 2019 LocalDB with JSON storage for flexible configuration
- **Connection Management**: 
  - ADO.NET connection pooling
  - Async database operations
  - Transaction support
  - Dapper for SQL queries (micro-ORM)

#### Repository Layer
1. **ApplicationRepository**
   - CRUD operations for applications
   - Uses ULID for unique identifiers
   - Validates data using FluentValidation
   - Automatically creates default configuration when creating applications

2. **ConfigurationRepository**
   - Configuration management for applications
   - JSON-based configuration storage
   - Supports upsert and retrieval operations

#### Data Validation
- **Schema Validation**: FluentValidation for request/response validation
- **Database Models**: C# DTOs and domain models for data representation
- **Input Sanitization**: Validators for data cleaning and validation

#### Database Schema
- **applications** table
  - Stores application metadata (id, name, description)
  - ULID-based primary key (stored as VARCHAR(26))
  - Unique name constraint
  - Automatic timestamp tracking via database triggers

- **configurations** table
  - Stores JSON configuration data
  - Foreign key to applications
  - NVARCHAR(MAX) with JSON storage for flexible configuration
  - Automatic timestamp tracking via database triggers

#### Migration System
- Fluent Migrations for database schema management
- Version tracking in migrations table
- Migration application via dotnet CLI

### Key Technical Decisions
- **Dapper Micro-ORM**: Uses Dapper with direct SQL queries for database access
- **ULID for IDs**: Uses Ulid-dotnet library for sortable, unique identifiers (API uses ULID objects, database stores as strings)
- **FluentValidation**: Comprehensive data validation using FluentValidation
- **Async Operations**: Async database operations for improved performance
- **JSON Storage**: Flexible configuration storage using MS SQL Server JSON capabilities
- **Repository Pattern**: Clean separation of data access logic

### API Endpoints
- `GET /api/v1/applications`: List all applications
- `POST /api/v1/applications`: Create a new application
- `GET /api/v1/applications/{id}`: Get application by ID
- `PUT /api/v1/applications/{id}`: Update application by ID
- `DELETE /api/v1/applications/{id}`: Delete an application
- `GET /api/v1/applications/{id}/config`: Get configuration for an application
- `PUT /api/v1/applications/{id}/config`: Update configuration for an application
- `GET /api/v1/config/{name}`: Get configuration by application name (main client endpoint)
- `GET /health`: Health check endpoint (root level, not versioned)

### Error Handling
- Consistent error response format using ErrorResponse schema
- Specific HTTP status codes (400 for bad requests, 404 for not found, 409 for conflicts, 422 for validation errors, 500 for server errors)
- Detailed error messages for troubleshooting
- Structured exception handling with appropriate HTTP status mapping

## UI Architecture

### System Overview
The Configuration Service UI is a web-based administration interface for managing application configurations. It's built using React with TypeScript for type safety and modern development experience.

### Core Components

#### Component Architecture
- **React Components**: Functional components using React hooks
- **Component Library**: Reusable React components with TypeScript
- **Component Hierarchy**:
  - ConfigApp: Main application component
  - ConfigDetail: Configuration details and editor component
  - CreateAppForm: Form component for creating new applications

#### State Management
- **Local State**: Component-level state using React hooks (useState, useEffect)
- **Props**: Data flow through component props
- **State Lifting**: Shared state managed at appropriate parent components
- **Minimal Redux**: Prefer local state over Redux for simplicity

#### API Communication
- **API Service**: Centralized service for backend communication
  - Single instance exported as `api` for application-wide use
  - Base URL configuration (`/api/v1` for versioned endpoints)
  - Standardized request method with automatic JSON handling
  - Comprehensive error handling with network error fallbacks
- **Response Handling**: Consistent response and error handling
  - Unified response type for all API calls
  - Success/error state discrimination
  - Automatic JSON parsing and error extraction
- **Type Safety**: TypeScript interfaces matching backend schemas
  - Request/response types mirror backend C# DTOs
  - Compile-time validation of API calls
  - IntelliSense support for API methods

### UI Features
- Application listing and selection
- Configuration viewing and editing
- Application creation
- Error handling and loading states

### Key Technical Decisions
- **React Framework**: Component-based architecture with hooks
- **TypeScript**: Type safety and improved developer experience
- **Local State First**: Prefer React hooks over global state management
- **Functional Components**: Modern React patterns with hooks
- **Modular Design**: Reusable, composable components

### Data Flow
1. Components request data from API service
2. API service communicates with backend API
3. Components update their local state based on API responses
4. Components re-render via React when state changes
5. User interactions trigger state updates via hooks
6. State changes trigger re-renders automatically

### Styling
- Component-scoped CSS modules or styled-components
- Consistent design language across components
- Responsive design for various screen sizes
