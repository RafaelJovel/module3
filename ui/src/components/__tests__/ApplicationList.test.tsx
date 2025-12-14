import { render, screen, waitFor } from '@testing-library/react';
import { ApplicationList } from '../ApplicationList';
import { api } from '../../services/api';
import type { ApplicationResponse } from '../../types/Application';

// Mock the API service
jest.mock('../../services/api');
const mockApi = api as jest.Mocked<typeof api>;

describe('ApplicationList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockApi.getApplications.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ApplicationList />);

    expect(screen.getByText('Loading applications...')).toBeInTheDocument();
  });

  it('should display applications when data is loaded', async () => {
    const mockApplications: ApplicationResponse[] = [
      {
        id: '01234567890123456789012345',
        name: 'test-app',
        description: 'Test Application',
      },
    ];

    mockApi.getApplications.mockResolvedValueOnce(mockApplications);

    render(<ApplicationList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('test-app')).toBeInTheDocument();
    expect(screen.getByText('Test Application')).toBeInTheDocument();
  });

  it('should display multiple applications correctly', async () => {
    const mockApplications: ApplicationResponse[] = [
      {
        id: '01234567890123456789012345',
        name: 'app-one',
        description: 'First Application',
      },
      {
        id: '01234567890123456789012346',
        name: 'app-two',
        description: 'Second Application',
      },
    ];

    mockApi.getApplications.mockResolvedValueOnce(mockApplications);

    render(<ApplicationList />);

    await waitFor(() => {
      expect(screen.getByText('app-one')).toBeInTheDocument();
    });

    expect(screen.getByText('app-one')).toBeInTheDocument();
    expect(screen.getByText('First Application')).toBeInTheDocument();
    expect(screen.getByText('app-two')).toBeInTheDocument();
    expect(screen.getByText('Second Application')).toBeInTheDocument();
  });

  it('should show error message on API failure', async () => {
    mockApi.getApplications.mockRejectedValueOnce(
      new Error('Failed to fetch applications: 500 Internal Server Error')
    );

    render(<ApplicationList />);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch applications: 500 Internal Server Error/)
      ).toBeInTheDocument();
    });
  });

  it('should show application names in list', async () => {
    const mockApplications: ApplicationResponse[] = [
      {
        id: '01234567890123456789012345',
        name: 'my-app',
        description: null,
      },
    ];

    mockApi.getApplications.mockResolvedValueOnce(mockApplications);

    render(<ApplicationList />);

    await waitFor(() => {
      expect(screen.getByText('my-app')).toBeInTheDocument();
    });

    expect(screen.getByText('my-app')).toBeInTheDocument();
  });

  it('should show application descriptions in list', async () => {
    const mockApplications: ApplicationResponse[] = [
      {
        id: '01234567890123456789012345',
        name: 'my-app',
        description: 'This is my application',
      },
    ];

    mockApi.getApplications.mockResolvedValueOnce(mockApplications);

    render(<ApplicationList />);

    await waitFor(() => {
      expect(screen.getByText('This is my application')).toBeInTheDocument();
    });

    expect(screen.getByText('This is my application')).toBeInTheDocument();
  });

  it('should not display description when null', async () => {
    const mockApplications: ApplicationResponse[] = [
      {
        id: '01234567890123456789012345',
        name: 'my-app',
        description: null,
      },
    ];

    mockApi.getApplications.mockResolvedValueOnce(mockApplications);

    render(<ApplicationList />);

    await waitFor(() => {
      expect(screen.getByText('my-app')).toBeInTheDocument();
    });

    // Check that only the name is present, no description paragraph
    const listItem = screen.getByText('my-app').closest('li');
    expect(listItem?.querySelector('p')).not.toBeInTheDocument();
  });

  it('should show empty state when no applications exist', async () => {
    const mockApplications: ApplicationResponse[] = [];

    mockApi.getApplications.mockResolvedValueOnce(mockApplications);

    render(<ApplicationList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No applications found.')).toBeInTheDocument();
    expect(screen.getByText('Create your first application to get started.')).toBeInTheDocument();
  });

  it('should show empty state message without application list', async () => {
    const mockApplications: ApplicationResponse[] = [];

    mockApi.getApplications.mockResolvedValueOnce(mockApplications);

    render(<ApplicationList />);

    await waitFor(() => {
      expect(screen.getByText('No applications found.')).toBeInTheDocument();
    });

    // Should not render the list when empty
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
