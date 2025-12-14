using ConfigService.Controllers;
using ConfigService.Models;
using ConfigService.Models.Responses;
using ConfigService.Repositories;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConfigService.Tests.Controllers;

public class ApplicationsControllerTests
{
    private readonly Mock<IApplicationRepository> _mockRepository;
    private readonly Mock<ILogger<ApplicationsController>> _mockLogger;
    private readonly ApplicationsController _controller;

    public ApplicationsControllerTests()
    {
        _mockRepository = new Mock<IApplicationRepository>();
        _mockLogger = new Mock<ILogger<ApplicationsController>>();
        _controller = new ApplicationsController(_mockRepository.Object, _mockLogger.Object);
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
}
