/**
 * 通用 HTTP 客户端封装类
 * 用于封装各种 HTTP 服务 API 调用
 */

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  path?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  query?: Record<string, string | number>;
}

export interface Response<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = config.headers || {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 构建 URL
   */
  private buildURL(path?: string, query?: Record<string, string | number>): string {
    let url = path ? `${this.baseURL}/${path.replace(/^\//, '')}` : this.baseURL;
    
    if (query) {
      const queryString = Object.entries(query)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * 合并请求头
   */
  private mergeHeaders(headers?: Record<string, string>): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...headers,
    };
  }

  /**
   * 发送 HTTP 请求
   */
  public async request<T = any>(options: RequestOptions): Promise<Response<T>> {
    const {
      path = '',
      method = 'GET',
      headers,
      body,
      query,
    } = options;

    const url = this.buildURL(path, query);
    const mergedHeaders = this.mergeHeaders(headers);

    try {
      const response = await fetch(url, {
        method,
        headers: mergedHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseData = await response.json();

      // 将 Headers 对象转换为普通对象
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        data: responseData as unknown as T,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      };
    } catch (error) {
      throw new Error(`HTTP 请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * GET 请求
   */
  public async get<T = any>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<Response<T>> {
    return this.request<T>({ ...options, path, method: 'GET' });
  }

  /**
   * POST 请求
   */
  public async post<T = any>(path: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<Response<T>> {
    return this.request<T>({ ...options, path, method: 'POST', body });
  }

  /**
   * PUT 请求
   */
  public async put<T = any>(path: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<Response<T>> {
    return this.request<T>({ ...options, path, method: 'PUT', body });
  }

  /**
   * DELETE 请求
   */
  public async delete<T = any>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<Response<T>> {
    return this.request<T>({ ...options, path, method: 'DELETE' });
  }

  /**
   * PATCH 请求
   */
  public async patch<T = any>(path: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<Response<T>> {
    return this.request<T>({ ...options, path, method: 'PATCH', body });
  }
}
