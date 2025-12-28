import { 
  type FilesResponse, 
  type MediaMetadata, 
  type ApiError,
  API_ENDPOINTS 
} from '@/types';

class ApiClient {
  private async fetch<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `HTTP Error: ${response.status}`,
          status: response.status,
        };
        throw error;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw { message: 'Request timeout', status: 408 } as ApiError;
        }
        throw { message: error.message } as ApiError;
      }
      throw error;
    }
  }

  async getFiles(): Promise<FilesResponse> {
    return this.fetch<FilesResponse>(API_ENDPOINTS.files);
  }

  async getMetadata(filename: string): Promise<MediaMetadata> {
    return this.fetch<MediaMetadata>(API_ENDPOINTS.metadata(filename));
  }

  getStreamUrl(filename: string): string {
    return API_ENDPOINTS.stream(filename);
  }
}

export const apiClient = new ApiClient();
