using ConfigService.Controllers;
using ConfigService.Models;
using ConfigService.Models.Requests;
using ConfigService.Models.Responses;
using ConfigService.Repositories;
using ConfigService.Validation;
using FluentAssertions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConfigService.Tests.Controllers;

public class ApplicationsControllerTests
{
    private readonly Mock<IApplicationRepository> _mockRepository;
    private readonly Mock<ILogger<ApplicationsController>> _mockLogger;
    private readonly IValidator<CreateApplicationRequest> _createValidator;
    private readonly ApplicationsController _controller;

    public ApplicationsControllerTests()
    {
        _mockRepository = new Mock<IApplicationRepository>();
        _mockLogger = new Mock<ILogger<ApplicationsController>>();
        _createValidator = new CreateApplicationRequestValidator();
        _controller = new ApplicationsController(
            _mockRepository.Object,
            _mockLogger.Object,
            _createValidator);
    }

    [Fact]
    public async Task GetApplications_Returns200_WithApplicationList()
    {
        // Arrange
        var applications = new List<Application>
        {
            new Application
            {
                Id = "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                Name = "test-app",
                Description = "Test application",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };
        _mockRepository.Setup(r => r.GetAllApplicationsAsync())
            .ReturnsAsync(applications);

        // Act
        var result = await _controller.GetApplications();

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as IEnumerable<ApplicationResponse>;
        response.Should().NotBeNull();
        response.Should().HaveCount(1);
        response!.First().Id.Should().Be("01ARZ3NDEKTSV4RRFFQ69G5FAV");
        response.First().Name.Should().Be("test-app");
        response.First().Description.Should().Be("Test application");
    }

    [Fact]
    public async Task GetApplications_Returns200_WithEmptyArray_WhenNoApplications()
    {
        // Arrange
        _mockRepository.Setup(r => r.GetAllApplicationsAsync())
            .ReturnsAsync(new List<Application>());

        // Act
        var result = await _controller.GetApplications();

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as IEnumerable<ApplicationResponse>;
        response.Should().NotBeNull();
        response.Should().BeEmpty();
    }

    [Fact]
    public async Task GetApplications_Returns500_WhenRepositoryThrowsException()
    {
        // Arrange
        _mockRepository.Setup(r => r.GetAllApplicationsAsync())
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.GetApplications();

        // Assert
        result.Result.Should().BeOfType<ObjectResult>();
        var objectResult = result.Result as ObjectResult;
        objectResult!.StatusCode.Should().Be(500);
        var errorResponse = objectResult.Value as ErrorResponse;
        errorResponse.Should().NotBeNull();
        errorResponse!.Message.Should().Be("An error occurred while retrieving applications");
        errorResponse.Details.Should().Be("Database error");
    }

    [Fact]
    public async Task CreateApplication_WithValidData_Returns201Created()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            Name = "test-app",
            Description = "Test application"
        };

        var createdApp = new Application
        {
            Id = "01ARZ3NDEKTSV4RRFFQ69G5FAV",
            Name = "test-app",
            Description = "Test application",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository.Setup(r => r.CreateAsync(request.Name, request.Description))
            .ReturnsAsync(createdApp);

        // Act
        var result = await _controller.CreateApplication(request);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        createdResult!.StatusCode.Should().Be(201);
        var response = createdResult.Value as ApplicationResponse;
        response.Should().NotBeNull();
        response!.Id.Should().Be("01ARZ3NDEKTSV4RRFFQ69G5FAV");
        response.Name.Should().Be("test-app");
        response.Description.Should().Be("Test application");
    }

    [Fact]
    public async Task CreateApplication_WithValidData_ReturnsCreatedApplication()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            Name = "new-app",
            Description = "New application"
        };

        var createdApp = new Application
        {
            Id = "01ARZ3NDEKTSV4RRFFQ69G5FAV",
            Name = "new-app",
            Description = "New application",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository.Setup(r => r.CreateAsync(request.Name, request.Description))
            .ReturnsAsync(createdApp);

        // Act
        var result = await _controller.CreateApplication(request);

        // Assert
        var createdResult = result.Result as CreatedAtActionResult;
        var response = createdResult!.Value as ApplicationResponse;
        response!.Name.Should().Be("new-app");
        response.Description.Should().Be("New application");
    }

    [Fact]
    public async Task CreateApplication_WithInvalidName_Returns422UnprocessableEntity()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            Name = "invalid name!", // Contains invalid characters
            Description = "Test application"
        };

        // Act
        var result = await _controller.CreateApplication(request);

        // Assert
        result.Result.Should().BeOfType<UnprocessableEntityObjectResult>();
        var unprocessableResult = result.Result as UnprocessableEntityObjectResult;
        var errorResponse = unprocessableResult!.Value as ErrorResponse;
        errorResponse.Should().NotBeNull();
        errorResponse!.Message.Should().Be("Validation failed");
        errorResponse.Details.Should().Contain("alphanumeric");
    }

    [Fact]
    public async Task CreateApplication_WithDuplicateName_Returns409Conflict()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            Name = "existing-app",
            Description = "Test application"
        };

        var sqlException = CreateSqlException(2627); // Unique constraint violation
        _mockRepository.Setup(r => r.CreateAsync(request.Name, request.Description))
            .ThrowsAsync(sqlException);

        // Act
        var result = await _controller.CreateApplication(request);

        // Assert
        result.Result.Should().BeOfType<ConflictObjectResult>();
        var conflictResult = result.Result as ConflictObjectResult;
        var errorResponse = conflictResult!.Value as ErrorResponse;
        errorResponse.Should().NotBeNull();
        errorResponse!.Message.Should().Be("An application with this name already exists");
        errorResponse.Details.Should().Contain("existing-app");
    }

    [Fact]
    public async Task CreateApplication_WithMissingName_Returns422UnprocessableEntity()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            Name = "", // Empty name
            Description = "Test application"
        };

        // Act
        var result = await _controller.CreateApplication(request);

        // Assert
        result.Result.Should().BeOfType<UnprocessableEntityObjectResult>();
        var unprocessableResult = result.Result as UnprocessableEntityObjectResult;
        var errorResponse = unprocessableResult!.Value as ErrorResponse;
        errorResponse.Should().NotBeNull();
        errorResponse!.Message.Should().Be("Validation failed");
        errorResponse.Details.Should().Contain("required");
    }

    [Fact]
    public async Task CreateApplication_IncludesLocationHeader_WithNewResourceUrl()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            Name = "test-app",
            Description = "Test application"
        };

        var createdApp = new Application
        {
            Id = "01ARZ3NDEKTSV4RRFFQ69G5FAV",
            Name = "test-app",
            Description = "Test application",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository.Setup(r => r.CreateAsync(request.Name, request.Description))
            .ReturnsAsync(createdApp);

        // Act
        var result = await _controller.CreateApplication(request);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        createdResult!.ActionName.Should().Be(nameof(ApplicationsController.GetApplications));
    }

    // Helper method to create SqlException for testing
    private static SqlException CreateSqlException(int number)
    {
        var collection = typeof(SqlErrorCollection)
            .GetConstructor(System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance, null, Type.EmptyTypes, null)!
            .Invoke(null) as SqlErrorCollection;

        var error = typeof(SqlError)
            .GetConstructor(System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                null,
                new[] { typeof(int), typeof(byte), typeof(byte), typeof(string), typeof(string), typeof(string), typeof(int), typeof(uint) },
                null)!
            .Invoke(new object[] { number, (byte)0, (byte)0, "server", "errorMsg", "procedure", 0, (uint)0 }) as SqlError;

        typeof(SqlErrorCollection)
            .GetMethod("Add", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .Invoke(collection, new object[] { error! });

        return typeof(SqlException)
            .GetConstructor(System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                null,
                new[] { typeof(string), typeof(SqlErrorCollection), typeof(Exception), typeof(Guid) },
                null)!
            .Invoke(new object[] { "error", collection!, null!, Guid.NewGuid() }) as SqlException ?? throw new InvalidOperationException();
    }
}
