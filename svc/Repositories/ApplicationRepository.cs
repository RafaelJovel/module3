using ConfigService.Models;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

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

    public async Task<Application> CreateAsync(string name, string? description)
    {
        // Generate new ULID for the application
        var id = Ulid.NewUlid().ToString();
        
        // Convert empty string to null for description
        var normalizedDescription = string.IsNullOrWhiteSpace(description) ? null : description;

        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        using var transaction = connection.BeginTransaction();
        
        try
        {
            // Insert the application
            const string insertAppSql = @"
                INSERT INTO applications (id, name, description)
                VALUES (@Id, @Name, @Description);
                
                SELECT id AS Id, name AS Name, description AS Description, 
                       created_at AS CreatedAt, updated_at AS UpdatedAt
                FROM applications
                WHERE id = @Id";

            var application = await connection.QuerySingleAsync<Application>(
                insertAppSql,
                new { Id = id, Name = name, Description = normalizedDescription },
                transaction);

            // Create default empty configuration for the application
            const string insertConfigSql = @"
                INSERT INTO configurations (application_id, config_data)
                VALUES (@ApplicationId, '{}')";

            await connection.ExecuteAsync(
                insertConfigSql,
                new { ApplicationId = id },
                transaction);

            await transaction.CommitAsync();
            
            return application;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
