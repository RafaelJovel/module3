using ConfigService.Models.Responses;
using ConfigService.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace ConfigService.Controllers;

[ApiController]
[Route("api/v1/applications")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationRepository _repository;
    private readonly ILogger<ApplicationsController> _logger;

    public ApplicationsController(
        IApplicationRepository repository,
        ILogger<ApplicationsController> logger)
    {
        _repository = repository;
        _logger = logger;
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
}
