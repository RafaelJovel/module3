import type { ApplicationResponse } from '../types/Application';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  async getApplications(): Promise<ApplicationResponse[]> {
    const response = await fetch(`${this.baseUrl}/applications`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch applications: ${response.status} ${errorText}`);
    }

    return response.json();
  }
}

export const api = new ApiService();
export default api;
