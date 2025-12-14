using System.Net;
using System.Net.Http.Json;
using ConfigService.Models.Requests;
using ConfigService.Models.Responses;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace ConfigService.Tests.Integration;

public class ApplicationsEndpointTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly string _connectionString;

    public ApplicationsEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();
        
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=ConfigService;Trusted_Connection=true;";
    }

    public async Task InitializeAsync()
    {
        // Clean the database before each test
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM applications";
        await command.ExecuteNonQueryAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GET_Applications_ReturnsEmptyArray_WhenDatabaseIsEmpty()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/applications");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var applications = await response.Content.ReadFromJsonAsync<List<ApplicationResponse>>();
        applications.Should().NotBeNull();
        applications.Should().BeEmpty();
    }

    [Fact]
    public async Task GET_Applications_ReturnsDataFromDatabase()
    {
        // Arrange - Insert test data
        await InsertTestApplication("01ARZ3NDEKTSV4RRFFQ69G5FAV", "test-app", "Test application");

        // Act
        var response = await _client.GetAsync("/api/v1/applications");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var applications = await response.Content.ReadFromJsonAsync<List<ApplicationResponse>>();
        applications.Should().NotBeNull();
        applications.Should().HaveCount(1);
        applications![0].Id.Should().Be("01ARZ3NDEKTSV4RRFFQ69G5FAV");
        applications[0].Name.Should().Be("test-app");
        applications[0].Description.Should().Be("Test application");
    }

    [Fact]
    public async Task GET_Applications_HandlesMultipleApplications()
    {
        // Arrange - Insert multiple test applications
        await InsertTestApplication("01ARZ3NDEKTSV4RRFFQ69G5FAV", "app-one", "First application");
        await InsertTestApplication("01ARZ3NDEKTSV4RRFFQ69G5FAW", "app-two", "Second application");
        await InsertTestApplication("01ARZ3NDEKTSV4RRFFQ69G5FAX", "app-three", null);

        // Act
        var response = await _client.GetAsync("/api/v1/applications");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var applications = await response.Content.ReadFromJsonAsync<List<ApplicationResponse>>();
        applications.Should().NotBeNull();
        applications.Should().HaveCount(3);
    }

    [Fact]
    public async Task GET_Applications_OrdersByName()
    {
        // Arrange - Insert applications in non-alphabetical order
        await InsertTestApplication("01ARZ3NDEKTSV4RRFFQ69G5FAV", "zebra", "Last alphabetically");
        await InsertTestApplication("01ARZ3NDEKTSV4RRFFQ69G5FAW", "alpha", "First alphabetically");
        await InsertTestApplication("01ARZ3NDEKTSV4RRFFQ69G5FAX", "middle", "Middle alphabetically");

        // Act
        var response = await _client.GetAsync("/api/v1/applications");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var applications = await response.Content.ReadFromJsonAsync<List<ApplicationResponse>>();
        applications.Should().NotBeNull();
        applications.Should().HaveCount(3);
        applications![0].Name.Should().Be("alpha");
        applications[1].Name.Should().Be("middle");
        applications[2].Name.Should().Be("zebra");
    }

    [Fact]
    public async Task POST_CreateApplication_EndToEnd_CreatesInDatabase()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            Name = "new-app",
            Description = "New application"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/applications", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdApp = await response.Content.ReadFromJsonAsync<ApplicationResponse>();
        createdApp.Should().NotBeNull();
        createdApp!.Name.Should().Be("new-app");
        createdApp.Description.Should().Be("New application");

        // Verify it was actually created in the database
        var dbApp = await GetApplicationFromDatabase(createdApp.Id);
        dbApp.Should().NotBeNull();
        dbApp!.Name.Should().Be("new-app");
    }

    [Fact]
    public async Task POST_CreateApplication_WithDuplicateName_Returns409Conflict()
    {
        // Arrange - Insert existing application
        await InsertTestApplication("01ARZ3NDEKTSV4RRFFQ69G5FAV", "existing-app", "Existing application");

        var request = new CreateApplicationRequest
        {
            Name = "existing-app",
            Description = "Duplicate name"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/applications", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        error.Should().NotBeNull();
        error!.Message.Should().Be("An application with this name already exists");
    }

    [Fact]
    public async Task POST_CreateApplication_CreatesDefaultConfiguration()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            Name = "app-with-config",
            Description = "Application with default config"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/applications", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdApp = await response.Content.ReadFromJsonAsync<ApplicationResponse>();

        // Verify default configuration was created
        var hasConfig = await HasDefaultConfiguration(createdApp!.Id);
        hasConfig.Should().BeTrue();
    }

    [Fact]
    public async Task POST_CreateApplication_ThenGetById_ReturnsCreatedApplication()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            Name = "retrievable-app",
            Description = "Can be retrieved"
        };

        // Act - Create the application
        var createResponse = await _client.PostAsJsonAsync("/api/v1/applications", request);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdApp = await createResponse.Content.ReadFromJsonAsync<ApplicationResponse>();

        // Act - Get all applications (since we don't have GET by ID yet)
        var getResponse = await _client.GetAsync("/api/v1/applications");
        var applications = await getResponse.Content.ReadFromJsonAsync<List<ApplicationResponse>>();

        // Assert
        applications.Should().NotBeNull();
        var foundApp = applications!.FirstOrDefault(a => a.Id == createdApp!.Id);
        foundApp.Should().NotBeNull();
        foundApp!.Name.Should().Be("retrievable-app");
        foundApp.Description.Should().Be("Can be retrieved");
    }

    private async Task InsertTestApplication(string id, string name, string? description)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = @"
            INSERT INTO applications (id, name, description, created_at, updated_at)
            VALUES (@id, @name, @description, GETUTCDATE(), GETUTCDATE())";
        command.Parameters.AddWithValue("@id", id);
        command.Parameters.AddWithValue("@name", name);
        command.Parameters.AddWithValue("@description", (object?)description ?? DBNull.Value);
        await command.ExecuteNonQueryAsync();
    }

    private async Task<ApplicationResponse?> GetApplicationFromDatabase(string id)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT id, name, description FROM applications WHERE id = @id";
        command.Parameters.AddWithValue("@id", id);
        
        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return new ApplicationResponse
        {
            Id = reader.GetString(0),
            Name = reader.GetString(1),
            Description = reader.IsDBNull(2) ? null : reader.GetString(2)
        };
    }

    private async Task<bool> HasDefaultConfiguration(string applicationId)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM configurations WHERE application_id = @id";
        command.Parameters.AddWithValue("@id", applicationId);
        
        var count = (int)(await command.ExecuteScalarAsync() ?? 0);
        return count > 0;
    }
}
