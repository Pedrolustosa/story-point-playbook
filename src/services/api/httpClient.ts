
import { ENV } from '../../config/env';
import { ApiResponse } from './types';

export interface ApiError {
  message: string;
  status?: number;
  errors?: string[];
}

class HttpClient {
  private baseURL: string;

  constructor() {
    this.baseURL = ENV.API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    console.log(`Making ${config.method || 'GET'} request to:`, url);

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        
        // Try to parse error response as ApiResponse
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.success === false) {
            const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
            (error as any).status = response.status;
            (error as any).errors = errorData.errors;
            throw error;
          }
        } catch (parseError) {
          // If parsing fails, create a generic error
        }
        
        const error = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        (error as any).status = response.status;
        throw error;
      }

      // Check if response has content
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      // Handle empty response
      if (!responseText) {
        console.log('Empty response received');
        return {
          success: true,
          message: 'Request completed successfully',
          data: null as T
        };
      }

      // Try to parse JSON
      try {
        const data: ApiResponse<T> = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        
        // Ensure we return the full ApiResponse structure
        if (data.success !== undefined) {
          return data;
        } else {
          // If response doesn't have ApiResponse structure, wrap it
          return {
            success: true,
            message: 'Success',
            data: data as T
          };
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text that failed to parse:', responseText);
        
        const error = new Error(`Invalid JSON response: ${(parseError as Error).message}`);
        (error as any).originalError = parseError;
        (error as any).responseText = responseText;
        throw error;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    console.log('Error details:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = {
        message: 'Network error - Unable to connect to server. Please check if the API is running and the URL is correct.',
        status: 0,
      };
      return networkError;
    }

    if (error.status) {
      return {
        message: error.message || 'An unexpected error occurred',
        status: error.status,
        errors: error.errors
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      status: error.status,
    };
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const httpClient = new HttpClient();
