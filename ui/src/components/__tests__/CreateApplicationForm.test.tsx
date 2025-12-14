import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateApplicationForm } from '../CreateApplicationForm';
import { api } from '../../services/api';
import type { ApplicationResponse } from '../../types/Application';

// Mock the API service
jest.mock('../../services/api', () => ({
  api: {
    createApplication: jest.fn(),
  },
}));

const mockCreateApplication = api.createApplication as jest.MockedFunction<typeof api.createApplication>;

describe('CreateApplicationForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('should render form with name field', () => {
      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('type', 'text');
    });

    it('should render form with description field', () => {
      render(<CreateApplicationForm />);

      const descriptionTextarea = screen.getByLabelText('Description');
      expect(descriptionTextarea).toBeInTheDocument();
      expect(descriptionTextarea.tagName).toBe('TEXTAREA');
    });

    it('should render submit button', () => {
      render(<CreateApplicationForm />);

      const submitButton = screen.getByRole('button', { name: 'Create Application' });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have accessible labels', () => {
      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      expect(nameInput).toHaveAttribute('id', 'app-name');

      const descriptionTextarea = screen.getByLabelText('Description');
      expect(descriptionTextarea).toHaveAttribute('id', 'app-description');
    });
  });

  describe('Form State Management', () => {
    it('should update name field when user types', async () => {
      const user = userEvent.setup({delay: null});
      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name') as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');

      expect(nameInput.value).toBe('test-app');
    });

    it('should update description field when user types', async () => {
      const user = userEvent.setup({delay: null});
      render(<CreateApplicationForm />);

      const descriptionTextarea = screen.getByLabelText('Description') as HTMLTextAreaElement;
      await user.clear(descriptionTextarea);
      await user.type(descriptionTextarea, 'Test description');

      expect(descriptionTextarea.value).toBe('Test description');
    });

    it('should clear messages when user starts typing after error', async () => {
      const user = userEvent.setup();
      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      // Submit empty form to get validation error
      await user.click(submitButton);
      expect(await screen.findByText('Application name is required')).toBeInTheDocument();

      // Start typing - error should clear
      await user.type(nameInput, 'a');
      expect(screen.queryByText('Application name is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should prevent submission with empty name', async () => {
      const user = userEvent.setup();
      render(<CreateApplicationForm />);

      const submitButton = screen.getByRole('button', { name: 'Create Application' });
      await user.click(submitButton);

      expect(await screen.findByText('Application name is required')).toBeInTheDocument();
      expect(mockCreateApplication).not.toHaveBeenCalled();
    });

    it('should prevent submission with whitespace-only name', async () => {
      const user = userEvent.setup({delay: null});
      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, '   ');
      await user.click(submitButton);

      expect(await screen.findByText('Application name is required')).toBeInTheDocument();
      expect(mockCreateApplication).not.toHaveBeenCalled();
    });

    it('should prevent submission with invalid name format (special characters)', async () => {
      const user = userEvent.setup({delay: null});
      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test@app!');
      await user.click(submitButton);

      expect(await screen.findByText('Application name can only contain letters, numbers, underscores, and hyphens')).toBeInTheDocument();
      expect(mockCreateApplication).not.toHaveBeenCalled();
    });

    it('should prevent submission with invalid name format (spaces)', async () => {
      const user = userEvent.setup({delay: null});
      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test app');
      await user.click(submitButton);

      expect(await screen.findByText('Application name can only contain letters, numbers, underscores, and hyphens')).toBeInTheDocument();
      expect(mockCreateApplication).not.toHaveBeenCalled();
    });

    it('should prevent submission with name exceeding max length', async () => {
      const user = userEvent.setup({delay: null});
      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'a'.repeat(256));
      await user.click(submitButton);

      expect(await screen.findByText('Application name must be 255 characters or less')).toBeInTheDocument();
      expect(mockCreateApplication).not.toHaveBeenCalled();
    });

    it('should prevent submission with description exceeding max length', async () => {
      const user = userEvent.setup({delay: null});
      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const descriptionTextarea = screen.getByLabelText('Description');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'valid-app');
      await user.clear(descriptionTextarea);
      await user.type(descriptionTextarea, 'a'.repeat(1001));
      await user.click(submitButton);

      expect(await screen.findByText('Description must be 1000 characters or less')).toBeInTheDocument();
      expect(mockCreateApplication).not.toHaveBeenCalled();
    });

    it('should allow submission with valid name (alphanumeric)', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'testapp123',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'testapp123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateApplication).toHaveBeenCalled();
      });
    });

    it('should allow submission with valid name (with underscores and hyphens)', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test_app-123',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test_app-123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateApplication).toHaveBeenCalled();
      });
    });

    it('should allow submission with valid name and optional description', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app',
        description: 'Test description',
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const descriptionTextarea = screen.getByLabelText('Description');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.clear(descriptionTextarea);
      await user.type(descriptionTextarea, 'Test description');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateApplication).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call API with correct payload', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'my-app',
        description: 'My description',
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const descriptionTextarea = screen.getByLabelText('Description');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'my-app');
      await user.clear(descriptionTextarea);
      await user.type(descriptionTextarea, 'My description');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateApplication).toHaveBeenCalledWith({
          name: 'my-app',
          description: 'My description',
        });
      });
    });

    it('should trim whitespace from name before submission', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'my-app',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, '  my-app  ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateApplication).toHaveBeenCalledWith({
          name: 'my-app',
          description: null,
        });
      });
    });

    it('should send null for empty description', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'my-app',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'my-app');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateApplication).toHaveBeenCalledWith({
          name: 'my-app',
          description: null,
        });
      });
    });

    it('should send null for whitespace-only description', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'my-app',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const descriptionTextarea = screen.getByLabelText('Description');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'my-app');
      await user.clear(descriptionTextarea);
      await user.type(descriptionTextarea, '   ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateApplication).toHaveBeenCalledWith({
          name: 'my-app',
          description: null,
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup({delay: null});
      let resolvePromise: (value: ApplicationResponse) => void;
      const mockPromise = new Promise<ApplicationResponse>((resolve) => {
        resolvePromise = resolve;
      });
      mockCreateApplication.mockReturnValue(mockPromise);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      // Check loading state
      expect(await screen.findByText('Creating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
      expect(nameInput).toBeDisabled();

      // Resolve the promise
      resolvePromise!({
        id: '01HQXYZ123',
        name: 'test-app',
        description: null,
      });

      await waitFor(() => {
        expect(screen.queryByText('Creating...')).not.toBeInTheDocument();
      });
    });

    it('should display success message after successful submission', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      expect(await screen.findByText('Application "test-app" created successfully!')).toBeInTheDocument();
    });

    it('should display error message on API failure', async () => {
      const user = userEvent.setup({delay: null});
      mockCreateApplication.mockRejectedValue(new Error('Network error'));

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      expect(await screen.findByText('Network error')).toBeInTheDocument();
    });

    it('should display error message for duplicate name (409 conflict)', async () => {
      const user = userEvent.setup({delay: null});
      mockCreateApplication.mockRejectedValue(new Error('Application with name "test-app" already exists'));

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      expect(await screen.findByText('Application with name "test-app" already exists')).toBeInTheDocument();
    });

    it('should display error message for validation error (422)', async () => {
      const user = userEvent.setup({delay: null});
      mockCreateApplication.mockRejectedValue(new Error('Invalid application name format'));

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      expect(await screen.findByText('Invalid application name format')).toBeInTheDocument();
    });

    it('should display generic error message for unexpected errors', async () => {
      const user = userEvent.setup({delay: null});
      mockCreateApplication.mockRejectedValue('Unexpected error'); // Non-Error object

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      expect(await screen.findByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    it('should remain enabled after successful submission', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Application "test-app" created successfully!')).toBeInTheDocument();
      });

      // Form should be enabled and reset (fields cleared)
      expect(nameInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
      expect(nameInput.value).toBe('');
    });
  });

  describe('Callback Integration', () => {
    it('should call onSuccess callback after successful API response', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app',
        description: 'Test description',
      };
      mockCreateApplication.mockResolvedValue(mockResponse);
      const onSuccess = jest.fn();

      render(<CreateApplicationForm onSuccess={onSuccess} />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      });
    });

    it('should NOT call onSuccess callback when API fails', async () => {
      const user = userEvent.setup({delay: null});
      mockCreateApplication.mockRejectedValue(new Error('Network error'));
      const onSuccess = jest.fn();

      render(<CreateApplicationForm onSuccess={onSuccess} />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should work without onSuccess callback (optional prop)', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      // Should not throw error and success message should display
      expect(await screen.findByText('Application "test-app" created successfully!')).toBeInTheDocument();
    });
  });

  describe('Form Reset Behavior', () => {
    it('should reset name field after successful submission', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput.value).toBe('');
      });
    });

    it('should reset description field after successful submission', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app',
        description: 'Test description',
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const descriptionTextarea = screen.getByLabelText('Description') as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.clear(descriptionTextarea);
      await user.type(descriptionTextarea, 'Test description');
      await user.click(submitButton);

      await waitFor(() => {
        expect(descriptionTextarea.value).toBe('');
      });
    });

    it('should keep success message visible after form reset', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput.value).toBe('');
      });

      // Success message should still be visible
      expect(screen.getByText('Application "test-app" created successfully!')).toBeInTheDocument();
    });

    it('should NOT reset form fields after API failure', async () => {
      const user = userEvent.setup({delay: null});
      mockCreateApplication.mockRejectedValue(new Error('Network error'));

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name') as HTMLInputElement;
      const descriptionTextarea = screen.getByLabelText('Description') as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.clear(descriptionTextarea);
      await user.type(descriptionTextarea, 'Test description');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Form should retain values after error
      expect(nameInput.value).toBe('test-app');
      expect(descriptionTextarea.value).toBe('Test description');
    });

    it('should allow creating multiple applications in sequence', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse1: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app-1',
        description: null,
      };
      const mockResponse2: ApplicationResponse = {
        id: '01HQXYZ124',
        name: 'test-app-2',
        description: null,
      };

      mockCreateApplication
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      // Create first application
      await user.clear(nameInput);
      await user.type(nameInput, 'test-app-1');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateApplication).toHaveBeenCalledWith({
          name: 'test-app-1',
          description: null,
        });
      });

      // Form should be reset and ready for next entry
      await waitFor(() => {
        expect((nameInput as HTMLInputElement).value).toBe('');
      });

      // Create second application
      await user.type(nameInput, 'test-app-2');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateApplication).toHaveBeenCalledWith({
          name: 'test-app-2',
          description: null,
        });
      });

      expect(mockCreateApplication).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes during loading state', async () => {
      const user = userEvent.setup({delay: null});
      let resolvePromise: (value: ApplicationResponse) => void;
      const mockPromise = new Promise<ApplicationResponse>((resolve) => {
        resolvePromise = resolve;
      });
      mockCreateApplication.mockReturnValue(mockPromise);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveAttribute('aria-busy', 'true');
      });

      // Resolve the promise
      resolvePromise!({
        id: '01HQXYZ123',
        name: 'test-app',
        description: null,
      });
    });

    it('should announce error messages to screen readers', async () => {
      const user = userEvent.setup();
      render(<CreateApplicationForm />);

      const submitButton = screen.getByRole('button', { name: 'Create Application' });
      await user.click(submitButton);

      const errorMessage = await screen.findByText('Application name is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });

    it('should announce success messages to screen readers', async () => {
      const user = userEvent.setup({delay: null});
      const mockResponse: ApplicationResponse = {
        id: '01HQXYZ123',
        name: 'test-app',
        description: null,
      };
      mockCreateApplication.mockResolvedValue(mockResponse);

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      const successMessage = await screen.findByText('Application "test-app" created successfully!');
      expect(successMessage).toHaveAttribute('role', 'status');
      expect(successMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup({delay: null});
      mockCreateApplication.mockRejectedValue(new Error('API error'));

      render(<CreateApplicationForm />);

      const nameInput = screen.getByLabelText('Application Name');
      const submitButton = screen.getByRole('button', { name: 'Create Application' });

      await user.clear(nameInput);
      await user.type(nameInput, 'test-app');
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-describedby', 'form-error');
      });
    });
  });
});
