using ConfigService.Models.Requests;
using ConfigService.Models.Responses;
using ConfigService.Repositories;
using ConfigService.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace ConfigService.Controllers;

[ApiController]
[Route("api/v1/applications")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationRepository _repository;
    private readonly ILogger<ApplicationsController> _logger;
    private readonly IValidator<CreateApplicationRequest> _createValidator;

    public ApplicationsController(
        IApplicationRepository repository,
        ILogger<ApplicationsController> logger,
        IValidator<CreateApplicationRequest> createValidator)
    {
        _repository = repository;
        _logger = logger;
        _createValidator = createValidator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ApplicationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ApplicationResponse>>> GetApplications()
    {
        try
        {
            var applications = await _repository.GetAllApplicationsAsync();
            var response = applications.Select(app => new ApplicationResponse
            {
                Id = app.Id,
                Name = app.Name,
                Description = app.Description
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving applications");
            return StatusCode(500, new ErrorResponse
            {
                Message = "An error occurred while retrieving applications",
                Details = ex.Message
            });
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApplicationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApplicationResponse>> CreateApplication(
        [FromBody] CreateApplicationRequest request)
    {
        // Validate the request
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage));
            return UnprocessableEntity(new ErrorResponse
            {
                Message = "Validation failed",
                Details = errors
            });
        }

        try
        {
            var application = await _repository.CreateAsync(request.Name, request.Description);
            var response = new ApplicationResponse
            {
                Id = application.Id,
                Name = application.Name,
                Description = application.Description
            };

            return CreatedAtAction(
                nameof(GetApplications),
                new { id = application.Id },
                response);
        }
        catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601) // Unique constraint violation
        {
            _logger.LogWarning(ex, "Duplicate application name: {Name}", request.Name);
            return Conflict(new ErrorResponse
            {
                Message = "An application with this name already exists",
                Details = $"Application name '{request.Name}' is already in use"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating application");
            return StatusCode(500, new ErrorResponse
            {
                Message = "An error occurred while creating the application",
                Details = ex.Message
            });
        }
    }
}
