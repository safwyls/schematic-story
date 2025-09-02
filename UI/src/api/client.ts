import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, any>
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'https://api.schematicstory.com';

class ApiClient {
  private client: AxiosInstance;
  private getAccessToken: (() => Promise<string | null>) | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  
  }

  setTokenGetter(tokenGetter: () => Promise<string | null>): void {
    this.getAccessToken = tokenGetter
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.getAccessToken) {
          try {
            const token = await this.getAccessToken()
            if (token && config.headers) {
              config.headers.Authorization = `Bearer ${token}`
            }
          } catch (error) {
            console.error('Failed to get access token:', error)
          }
        }
        return config
      },
      (error: AxiosError) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.warn('Authentication failed, user may need to sign in again')
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data.data
  }

  async post<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async put<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async delete<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data.data
  }
}

export default new ApiClient();