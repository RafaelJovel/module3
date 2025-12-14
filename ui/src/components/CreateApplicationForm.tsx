import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { api } from '../services/api';
import styles from './CreateApplicationForm.module.css';

const NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const MAX_NAME_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;

export function CreateApplicationForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    // Clear messages when user starts typing
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    // Clear messages when user starts typing
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const validateForm = (): string | null => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return 'Application name is required';
    }

    if (trimmedName.length > MAX_NAME_LENGTH) {
      return `Application name must be ${MAX_NAME_LENGTH} characters or less`;
    }

    if (!NAME_PATTERN.test(trimmedName)) {
      return 'Application name can only contain letters, numbers, underscores, and hyphens';
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Prepare request
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const request = {
      name: trimmedName,
      description: trimmedDescription || null,
    };

    // Submit to API
    setIsLoading(true);
    try {
      const response = await api.createApplication(request);
      setSuccessMessage(`Application "${response.name}" created successfully!`);
      // Note: We're not clearing the form here - that's deferred to Task 5
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create New Application</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="app-name" className={styles.label}>
            Application Name
          </label>
          <input
            type="text"
            id="app-name"
            name="name"
            className={styles.input}
            placeholder="Enter application name"
            value={name}
            onChange={handleNameChange}
            disabled={isLoading}
            aria-describedby={errorMessage ? 'form-error' : undefined}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="app-description" className={styles.label}>
            Description
          </label>
          <textarea
            id="app-description"
            name="description"
            className={styles.textarea}
            placeholder="Enter application description (optional)"
            rows={4}
            value={description}
            onChange={handleDescriptionChange}
            disabled={isLoading}
            aria-describedby={errorMessage ? 'form-error' : undefined}
          />
        </div>

        {successMessage && (
          <div className={styles.successMessage} role="status" aria-live="polite">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className={styles.errorMessage} id="form-error" role="alert" aria-live="assertive">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Application'}
        </button>
      </form>
    </div>
  );
}
