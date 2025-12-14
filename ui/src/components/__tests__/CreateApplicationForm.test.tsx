import { render, screen } from '@testing-library/react';
import { CreateApplicationForm } from '../CreateApplicationForm';

describe('CreateApplicationForm Component', () => {
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

  it('should have correct label for name field', () => {
    render(<CreateApplicationForm />);

    const label = screen.getByText('Application Name');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('should have correct label for description field', () => {
    render(<CreateApplicationForm />);

    const label = screen.getByText('Description');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('should have correct text on submit button', () => {
    render(<CreateApplicationForm />);

    const submitButton = screen.getByRole('button', { name: 'Create Application' });
    expect(submitButton).toHaveTextContent('Create Application');
  });

  it('should have accessible labels', () => {
    render(<CreateApplicationForm />);

    // Check name field has proper label association
    const nameInput = screen.getByLabelText('Application Name');
    expect(nameInput).toHaveAttribute('id', 'app-name');

    // Check description field has proper label association
    const descriptionTextarea = screen.getByLabelText('Description');
    expect(descriptionTextarea).toHaveAttribute('id', 'app-description');
  });
});
