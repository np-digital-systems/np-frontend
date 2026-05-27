import { env } from "@/config/env";
import type { HttpError, RequestConfig, HttpMethod } from "@/types/api.types";

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);

    if (config?.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: config?.signal,
    });

    if (!response.ok) {
      const error: HttpError = {
        status: response.status,
        message: response.statusText,
      };
      throw error;
    }

    return response.json();
  }

  get<T>(path: string, config?: RequestConfig) {
    return this.request<T>("GET", path, undefined, config);
  }

  post<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>("POST", path, body, config);
  }

  put<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>("PUT", path, body, config);
  }

  patch<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>("PATCH", path, body, config);
  }

  delete<T>(path: string, config?: RequestConfig) {
    return this.request<T>("DELETE", path, undefined, config);
  }
}

export const httpClient = new HttpClient(env.apiUrl);
