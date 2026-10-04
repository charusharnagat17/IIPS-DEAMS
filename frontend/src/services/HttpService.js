import { apiRequest } from '../api/client';

export class HttpService {
  constructor(baseEndpoint = '') {
    this.baseEndpoint = baseEndpoint;
  }

  async get(path, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseEndpoint}${path}${query ? `?${query}` : ''}`;
    return apiRequest(url, { method: 'GET' });
  }

  async post(path, body = {}) {
    const url = `${this.baseEndpoint}${path}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async put(path, body = {}) {
    const url = `${this.baseEndpoint}${path}`;
    return apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async delete(path) {
    const url = `${this.baseEndpoint}${path}`;
    return apiRequest(url, { method: 'DELETE' });
  }
}

export const defaultHttpService = new HttpService();
