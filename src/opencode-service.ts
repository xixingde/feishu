/**
 * OpenCode Server API 封装类
 * 基于 https://opencode.ai/docs/server 接口封装
 */

import { HttpClient, HttpClientConfig, RequestOptions, Response } from './http-client';

// 请求/响应类型定义（根据实际 API 文档调整）
export interface CreateServerRequest {
  name: string;
  description?: string;
  type?: string;
  config?: Record<string, any>;
}

export interface ServerResponse {
  id: string;
  name: string;
  description?: string;
  type?: string;
  config?: Record<string, any>;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListServersParams {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
}

export interface UpdateServerRequest {
  name?: string;
  description?: string;
  config?: Record<string, any>;
}

export class OpenCodeServerService {
  private httpClient: HttpClient;

  constructor(config: Omit<HttpClientConfig, 'headers'>) {
    this.httpClient = new HttpClient({
      ...config,
      headers: {
        'Content-Type': 'application/json',
        // 可以在这里添加认证 token 等公共头部
        // 'Authorization': 'Bearer YOUR_TOKEN',
      },
    });
  }

  /**
   * 获取服务器列表
   * GET /servers
   */
  public async listServers(params?: ListServersParams): Promise<Response<ServerResponse[]>> {
    return this.httpClient.get<ServerResponse[]>('servers', {
      query: params as Record<string, string | number>
    });
  }

  /**
   * 获取单个服务器详情
   * GET /servers/:id
   */
  public async getServer(serverId: string): Promise<Response<ServerResponse>> {
    return this.httpClient.get<ServerResponse>(`servers/${serverId}`);
  }

  /**
   * 创建新服务器
   * POST /servers
   */
  public async createServer(data: CreateServerRequest): Promise<Response<ServerResponse>> {
    return this.httpClient.post<ServerResponse>('servers', data);
  }

  /**
   * 更新服务器信息
   * PUT /servers/:id
   */
  public async updateServer(serverId: string, data: UpdateServerRequest): Promise<Response<ServerResponse>> {
    return this.httpClient.put<ServerResponse>(`servers/${serverId}`, data);
  }

  /**
   * 删除服务器
   * DELETE /servers/:id
   */
  public async deleteServer(serverId: string): Promise<Response<void>> {
    return this.httpClient.delete<void>(`servers/${serverId}`);
  }

  /**
   * 启动服务器
   * POST /servers/:id/start
   */
  public async startServer(serverId: string): Promise<Response<ServerResponse>> {
    return this.httpClient.post<ServerResponse>(`servers/${serverId}/start`);
  }

  /**
   * 停止服务器
   * POST /servers/:id/stop
   */
  public async stopServer(serverId: string): Promise<Response<ServerResponse>> {
    return this.httpClient.post<ServerResponse>(`servers/${serverId}/stop`);
  }

  /**
   * 重启服务器
   * POST /servers/:id/restart
   */
  public async restartServer(serverId: string): Promise<Response<ServerResponse>> {
    return this.httpClient.post<ServerResponse>(`servers/${serverId}/restart`);
  }

  /**
   * 获取服务器状态
   * GET /servers/:id/status
   */
  public async getServerStatus(serverId: string): Promise<Response<any>> {
    return this.httpClient.get<any>(`servers/${serverId}/status`);
  }

  /**
   * 获取服务器日志
   * GET /servers/:id/logs
   */
  public async getServerLogs(serverId: string, options?: { lines?: number; tail?: boolean }): Promise<Response<any>> {
    const queryParams: Record<string, string | number> = {};
    if (options?.lines !== undefined) {
      queryParams.lines = options.lines;
    }
    if (options?.tail !== undefined) {
      queryParams.tail = options.tail ? 1 : 0;
    }
    return this.httpClient.get<any>(`servers/${serverId}/logs`, { query: queryParams });
  }

  /**
   * 自定义请求
   * 用于调用上述方法未涵盖的其他接口
   */
  public async customRequest<T = any>(options: RequestOptions): Promise<Response<T>> {
    return this.httpClient.request<T>(options);
  }
}

// 导出单例实例，方便使用
let openCodeServiceInstance: OpenCodeServerService | null = null;

export const initOpenCodeService = (baseURL: string, config?: Partial<Omit<HttpClientConfig, 'baseURL'>>): OpenCodeServerService => {
  openCodeServiceInstance = new OpenCodeServerService({
    baseURL,
    ...config,
  });
  return openCodeServiceInstance;
};

export const getOpenCodeService = (): OpenCodeServerService => {
  if (!openCodeServiceInstance) {
    throw new Error('OpenCode 服务未初始化，请先调用 initOpenCodeService');
  }
  return openCodeServiceInstance;
};
