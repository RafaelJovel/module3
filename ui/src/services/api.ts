import type { ApplicationResponse, CreateApplicationRequest } from '../types/Application';

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

  async createApplication(request: CreateApplicationRequest): Promise<ApplicationResponse> {
    const response = await fetch(`${this.baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create application: ${response.status}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          if (errorData.details) {
            errorMessage += ` - ${errorData.details}`;
          }
        }
      } catch {
        // If error response is not JSON, use status text
        errorMessage = `Failed to create application: ${response.status} ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export const api = new ApiService();
export default api;
