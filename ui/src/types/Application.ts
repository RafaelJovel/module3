export interface ApplicationResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string | null;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
