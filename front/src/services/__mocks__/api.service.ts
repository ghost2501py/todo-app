// Manual mock for api.service to avoid import.meta issues in Jest

export const api = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

export const apiService = {
  setTokenGetter: jest.fn(),
  getAxiosInstance: jest.fn(() => api)
};



