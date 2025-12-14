import { api } from '../api';
import type { ApplicationResponse } from '../../types/Application';

// Mock fetch globally
globalThis.fetch = jest.fn() as jest.Mock;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApplications', () => {
    it('should call correct endpoint with GET method', async () => {
      const mockApplications: ApplicationResponse[] = [];
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApplications,
      });

      await api.getApplications();

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/applications');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return applications list on success', async () => {
      const mockApplications: ApplicationResponse[] = [
        { id: '01234567890123456789012345', name: 'test-app', description: 'Test Application' },
        { id: '01234567890123456789012346', name: 'another-app', description: null },
      ];

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApplications,
      });

      const result = await api.getApplications();

      expect(result).toEqual(mockApplications);
      expect(result).toHaveLength(2);
    });

    it('should throw error on 404 response', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      });

      await expect(api.getApplications()).rejects.toThrow('Failed to fetch applications: 404 Not Found');
    });

    it('should throw error on 500 response', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(api.getApplications()).rejects.toThrow('Failed to fetch applications: 500 Internal Server Error');
    });

    it('should throw error on network failure', async () => {
      (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getApplications()).rejects.toThrow('Network error');
    });
  });
});
