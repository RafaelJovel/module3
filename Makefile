.PHONY: help install test run-svc run-ui test-svc test-ui db-migrate db-reset format lint coverage-svc coverage-ui ui-build clean

help:
	@echo "Configuration Service - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install       - Install all dependencies (svc + ui)"
	@echo ""
	@echo "Development:"
	@echo "  make run-svc       - Start API server (localhost:5000)"
	@echo "  make run-ui        - Start UI dev server (localhost:3000)"
	@echo ""
	@echo "Testing:"
	@echo "  make test          - Run all tests (svc + ui)"
	@echo "  make test-svc      - Run backend tests"
	@echo "  make test-ui       - Run frontend tests"
	@echo "  make coverage-svc  - Backend test coverage"
	@echo "  make coverage-ui   - Frontend test coverage"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate    - Apply database migrations"
	@echo "  make db-reset      - Reset database (drop and recreate)"
	@echo ""
	@echo "Quality:"
	@echo "  make format        - Format C# code"
	@echo "  make lint          - Run .NET linting checks"
	@echo ""
	@echo "Build:"
	@echo "  make ui-build      - Build UI for production"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean         - Remove generated files and caches"

install:
	@echo "Installing backend dependencies..."
	cd svc && dotnet restore
	@echo "Installing test dependencies..."
	cd svc.Tests && dotnet restore
	@echo "Backend dependencies installed successfully"

test: test-svc
	@echo "All tests completed"

test-svc:
	@echo "Running backend tests..."
	cd svc.Tests && dotnet test

run-svc:
	@echo "Starting API server on http://localhost:5000..."
	cd svc && dotnet run

db-migrate:
	@echo "Applying database migrations..."
	cd svc && dotnet fm migrate -p sqlserver -c "Server=(localdb)\\MSSQLLocalDB;Database=ConfigService;Trusted_Connection=true;"

db-reset:
	@echo "Resetting database..."
	@echo "Note: Manual database reset required - drop and recreate ConfigService database"

format:
	@echo "Formatting C# code..."
	cd svc && dotnet format

lint:
	@echo "Running .NET linting checks..."
	cd svc && dotnet build /p:EnforceCodeStyleInBuild=true

coverage-svc:
	@echo "Running backend tests with coverage..."
	cd svc.Tests && dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

run-ui:
	@echo "UI not yet implemented"

test-ui:
	@echo "UI tests not yet implemented"

coverage-ui:
	@echo "UI coverage not yet implemented"

ui-build:
	@echo "UI build not yet implemented"

clean:
	@echo "Cleaning generated files..."
	cd svc && dotnet clean
	cd svc.Tests && dotnet clean
	@echo "Clean completed"
