using System.Net;
using System.Net.Http.Json;
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
}
