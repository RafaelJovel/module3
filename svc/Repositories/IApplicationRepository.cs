using ConfigService.Models;

namespace ConfigService.Repositories;

public interface IApplicationRepository
{
    Task<IEnumerable<Application>> GetAllApplicationsAsync();
}
