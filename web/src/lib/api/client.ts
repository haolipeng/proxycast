/**
 * HTTP API 客户端
 *
 * 替代 Tauri invoke 调用，提供统一的 HTTP 请求接口
 */

const API_BASE = import.meta.env.VITE_API_BASE || '';
const MANAGEMENT_API_PREFIX = '/api/management';

interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
}

class ApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // 处理空响应
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  get<T>(path: string): Promise<T> {
    return this.request('GET', path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request('POST', path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request('PUT', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request('DELETE', path);
  }

  /**
   * 设置 API Key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
}

// 创建默认客户端实例
export const apiClient = new ApiClient({
  baseUrl: API_BASE,
});

// 管理 API 辅助函数
export const managementApi = {
  get<T>(path: string): Promise<T> {
    return apiClient.get(`${MANAGEMENT_API_PREFIX}${path}`);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return apiClient.post(`${MANAGEMENT_API_PREFIX}${path}`, body);
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return apiClient.put(`${MANAGEMENT_API_PREFIX}${path}`, body);
  },

  delete<T>(path: string): Promise<T> {
    return apiClient.delete(`${MANAGEMENT_API_PREFIX}${path}`);
  },
};

export default apiClient;
