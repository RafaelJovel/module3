using ConfigService.Models.Requests;
using ConfigService.Validation;
using FluentValidation.TestHelper;
using Xunit;

namespace ConfigService.Tests.Validation;

public class CreateApplicationRequestValidatorTests
{
    private readonly CreateApplicationRequestValidator _validator;

    public CreateApplicationRequestValidatorTests()
    {
        _validator = new CreateApplicationRequestValidator();
    }

    [Fact]
    public void Validator_WithValidName_PassesValidation()
    {
        var request = new CreateApplicationRequest
        {
            Name = "test-app",
            Description = "Test description"
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validator_WithEmptyName_FailsValidation()
    {
        var request = new CreateApplicationRequest
        {
            Name = "",
            Description = "Test description"
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Application name is required");
    }

    [Fact]
    public void Validator_WithInvalidCharacters_FailsValidation()
    {
        var request = new CreateApplicationRequest
        {
            Name = "test app!", // Spaces and special chars not allowed
            Description = "Test description"
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Application name can only contain alphanumeric characters, underscores, and hyphens");
    }

    [Fact]
    public void Validator_WithNameTooLong_FailsValidation()
    {
        var request = new CreateApplicationRequest
        {
            Name = new string('a', 256), // 256 characters, max is 255
            Description = "Test description"
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Application name must be between 1 and 255 characters");
    }

    [Fact]
    public void Validator_WithDescriptionTooLong_FailsValidation()
    {
        var request = new CreateApplicationRequest
        {
            Name = "test-app",
            Description = new string('a', 1001) // 1001 characters, max is 1000
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Description)
            .WithErrorMessage("Description must not exceed 1000 characters");
    }

    [Fact]
    public void Validator_WithNullDescription_PassesValidation()
    {
        var request = new CreateApplicationRequest
        {
            Name = "test-app",
            Description = null
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validator_WithValidNameAndUnderscore_PassesValidation()
    {
        var request = new CreateApplicationRequest
        {
            Name = "test_app_123",
            Description = "Test description"
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validator_WithValidNameAndHyphen_PassesValidation()
    {
        var request = new CreateApplicationRequest
        {
            Name = "test-app-123",
            Description = "Test description"
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
