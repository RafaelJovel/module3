using ConfigService.Models.Requests;
using FluentValidation;

namespace ConfigService.Validation;

public class CreateApplicationRequestValidator : AbstractValidator<CreateApplicationRequest>
{
    public CreateApplicationRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Application name is required")
            .Length(1, 255)
            .WithMessage("Application name must be between 1 and 255 characters")
            .Matches(@"^[a-zA-Z0-9_\-]+$")
            .WithMessage("Application name can only contain alphanumeric characters, underscores, and hyphens");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description must not exceed 1000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}
