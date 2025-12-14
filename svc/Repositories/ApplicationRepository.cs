using ConfigService.Models;
using Dapper;
using Microsoft.Data.SqlClient;

namespace ConfigService.Repositories;

public class ApplicationRepository : IApplicationRepository
{
    private readonly string _connectionString;

    public ApplicationRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string is not configured");
    }

    public async Task<IEnumerable<Application>> GetAllApplicationsAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = @"
            SELECT id AS Id, name AS Name, description AS Description, 
                   created_at AS CreatedAt, updated_at AS UpdatedAt
            FROM applications
            ORDER BY name";
        
        return await connection.QueryAsync<Application>(sql);
    }
}
