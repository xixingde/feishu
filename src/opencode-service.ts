/**
 * OpenCode Server API 封装类
 * 基于 https://opencode.ai/docs/server 接口封装
 */

import { EventSource } from 'eventsource';
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

// Session 相关类型定义
export interface CreateSessionRequest {
  parentID?: string;
  title?: string;
}

export interface SessionResponse {
  id: string;
  parentID?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // 允许其他未知字段
}

// SSE 相关类型定义
export interface MessagePartDeltaPayload {
  type: 'message.part.delta';
  properties: {
    sessionID: string;
    delta: string;
  };
}

export interface SessionStatusPayload {
  type: 'session.status';
  properties: {
    sessionID: string;
    status: {
      type: 'idle' | 'busy' | string;
    };
  };
}

export interface SessionErrorPayload {
  type: 'session.error';
  properties: {
    sessionID: string;
    error: string;
  };
}

export interface SessionUpdatedPayload {
  type: 'session.updated';
  properties: {
    info: {
      id: string;
      slug: string;
      projectID: string;
      directory: string;
      title: string;
      version: string;
      summary?: Record<string, any>;
      time?: Record<string, any>;
    };
  };
}

export type SSEPayload = MessagePartDeltaPayload | SessionStatusPayload | SessionErrorPayload | SessionUpdatedPayload | SessionDiffPayload;

export interface SessionDiffPayload {
  type: 'session.diff';
  properties: {
    sessionID: string;
    diff: string[];
  };
}

export interface SSEMessage {
  payload?: SSEPayload;
  type?: string;
  properties?: Record<string, any>;
}

export interface PromptRequest {
  parts: Array<{ type: 'text'; text: string }>;
  agent?: string;
}

export interface SSECallbacks {
  onDelta?: (delta: string, sessionID: string) => void;
  onComplete?: (sessionID: string) => void;
  onError?: (error: string, sessionID: string) => void;
  onMessage?: (data: SSEMessage) => void;
  onSessionUpdated?: (info: SessionUpdatedPayload['properties']['info'], sessionID: string) => void;
}

export class OpenCodeServerService {
  private httpClient: HttpClient;
  private baseURL: string;

  constructor(config: Omit<HttpClientConfig, 'headers'>) {
    this.baseURL = config.baseURL;
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
   * 创建新会话
   * POST /session
   */
  public async createSession(data: CreateSessionRequest): Promise<Response<SessionResponse>> {
    return this.httpClient.post<SessionResponse>('session', data);
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

  /**
   * 创建 SSE EventSource 连接
   * @param sessionID 会话 ID
   * @param callbacks 回调函数
   * @returns EventSource 实例（需手动关闭）
   */
  public createSSEConnection(
    sessionID: string,
    callbacks: SSECallbacks
  ): EventSource {
    const eventSourceUrl = `${this.baseURL}/event`;
    const es = new EventSource(eventSourceUrl);

    es.onmessage = (event: MessageEvent) => {
      if (!event.data) {
        console.warn('收到空消息');
        return;
      }

      let data: SSEMessage;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.error('JSON 解析失败：', err);
        console.error('原始数据：', event.data);
        return;
      }

      // 支持两种格式：1. { payload: {...} }  2. { type: '...', properties: {...} }
      const payload = data.payload || (data.type && data.properties ? { type: data.type, properties: data.properties } : null);

      // 回调原始消息
      if (callbacks.onMessage) {
        callbacks.onMessage(data);
      }

      if (!payload) {
        console.warn('收到无 payload 的消息：', data);
        return;
      }

      // 实时接收 AI 流式输出
      if (payload.type === 'message.part.delta' && payload.properties?.sessionID === sessionID) {
        const delta = payload.properties.delta;
        if (callbacks.onDelta) {
          callbacks.onDelta(delta, sessionID);
        }
      }

      // 处理 session.diff 消息
      if (payload.type === 'session.diff' && payload.properties?.sessionID === sessionID) {
        const diff = payload.properties.diff;
        if (diff && diff.length > 0) {
          // 将 diff 数组的每个元素作为 delta 处理
          diff.forEach((d: string) => {
            if (callbacks.onDelta) {
              callbacks.onDelta(d, sessionID);
            }
          });
        }
      }

      // 监听完成信号
      if (payload.type === 'session.status'
          && payload.properties?.sessionID === sessionID
          && payload.properties.status?.type === 'idle') {
        if (callbacks.onComplete) {
          callbacks.onComplete(sessionID);
        }
        es.close();
      }

      // 监听错误
      if (payload.type === 'session.error' && payload.properties?.sessionID === sessionID) {
        const error = payload.properties.error;
        if (callbacks.onError) {
          callbacks.onError(error, sessionID);
        }
        es.close();
      }

      // 监听会话更新
      if (payload.type === 'session.updated' && payload.properties?.info) {
        const info = payload.properties.info;
        if (callbacks.onSessionUpdated) {
          callbacks.onSessionUpdated(info, sessionID);
        }
      }
    };

    es.onerror = (err) => {
      console.error('SSE 连接错误：', err);
      es.close();
    };

    return es;
  }

  /**
   * 发送异步消息并通过 SSE 接收流式响应
   * @param sessionID 会话 ID
   * @param prompt 消息内容
   * @param agent 代理类型（可选）
   * @param callbacks 回调函数
   * @returns Promise<void> - 发送请求后立即返回
   */
  public async sendPromptWithSSE(
    sessionID: string,
    prompt: string,
    agent: string = 'StrictSpec',
    callbacks: SSECallbacks
  ): Promise<void> {
    // 先建立 SSE 连接
    const es = this.createSSEConnection(sessionID, callbacks);

    // 发送异步消息（204 立即返回）
    await this.httpClient.post<void>(`session/${sessionID}/prompt_async`, {
      parts: [{ type: 'text', text: prompt }],
      agent,
    } as PromptRequest);

    // 返回 void，调用者可以通过回调处理流式响应
    // 注意：如果需要等待完成，可使用 Promise 包装
    return;
  }

  /**
   * 发送异步消息并返回完整响应（等待 SSE 完成）
   * @param sessionID 会话 ID
   * @param prompt 消息内容
   * @param agent 代理类型（可选）
   * @returns 包含完整响应的 Promise
   */
  public async sendPromptAndWait(
    sessionID: string,
    prompt: string,
    agent: string = 'StrictSpec'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let fullResponse = '';

      this.sendPromptWithSSE(
        sessionID,
        prompt,
        agent,
        {
          onDelta: (delta) => {
            fullResponse += delta;
          },
          onComplete: () => {
            resolve(fullResponse);
          },
          onError: (error) => {
            reject(new Error(error));
          },
        }
      ).catch(reject);
    });
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
