import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private getAccessToken: (() => Promise<string>) | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.getAccessToken) {
          try {
            const token = await this.getAccessToken();
            if (token && config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Failed to get access token:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  setTokenGetter(getter: () => Promise<string>) {
    this.getAccessToken = getter;
  }

  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.getAxiosInstance();

