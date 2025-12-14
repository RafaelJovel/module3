-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ConfigService')
BEGIN
    CREATE DATABASE ConfigService;
END
GO

USE ConfigService;
GO

-- Create applications table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'applications')
BEGIN
    CREATE TABLE applications (
        id VARCHAR(26) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description VARCHAR(1000) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- Insert some sample data for testing
IF NOT EXISTS (SELECT * FROM applications WHERE name = 'sample-web-app')
BEGIN
    INSERT INTO applications (id, name, description, created_at, updated_at)
    VALUES 
        ('01HZQK5K6GQZX9YP8W7V6U5T4S', 'sample-web-app', 'Sample web application configuration', GETUTCDATE(), GETUTCDATE()),
        ('01HZQK5K6GQZX9YP8W7V6U5T4T', 'mobile-app', 'Mobile application configuration', GETUTCDATE(), GETUTCDATE()),
        ('01HZQK5K6GQZX9YP8W7V6U5T4U', 'api-service', 'Backend API service configuration', GETUTCDATE(), GETUTCDATE());
END
GO
