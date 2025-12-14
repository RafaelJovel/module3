namespace ConfigService.Models.Responses;

public class ApplicationResponse
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
}
