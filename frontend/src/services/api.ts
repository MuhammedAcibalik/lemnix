import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  OptimizationResponse, 
  TestOptimizationResponse,
  OptimizationItem,
  MaterialStockLength
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        return Promise.reject(error);
      }
    );
  }


  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Hata yönetimi
   */
  private handleError(error: any): ApiResponse<any> {
    if (error.response) {
      // Server error
      return {
        success: false,
        error: {
          message: error.response.data?.error?.message || 'Sunucu hatası',
          code: error.response.data?.error?.code || 'SERVER_ERROR',
          details: error.response.data?.error?.details
        }
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: {
          message: 'Ağ bağlantısı hatası',
          code: 'NETWORK_ERROR'
        }
      };
    } else {
      // Other error
      return {
        success: false,
        error: {
          message: 'Bilinmeyen hata',
          code: 'UNKNOWN_ERROR'
        }
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;
