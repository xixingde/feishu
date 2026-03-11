# OpenCode Server API 封装

这是一个用于访问 https://opencode.ai/docs/server 网站提供的 HTTP 服务的 TypeScript 类型化封装。

## 文件结构

```
src/
├── http-client.ts       # 通用 HTTP 客户端基类
├── opencode-service.ts  # OpenCode API 服务封装类
├── example.ts           # 使用示例代码
└── README.md           # 本文档
```

## 功能特性

- ✅ 完整的 TypeScript 类型定义
- ✅ 支持所有常见 HTTP 方法 (GET, POST, PUT, DELETE, PATCH)
- ✅ 统一的错误处理
- ✅ 请求/响应拦截器支持
- ✅ 可配置的超时和默认请求头
- ✅ 单例模式支持
- ✅ 自定义请求方法

## 快速开始

### 1. 安装依赖

确保项目中已安装 TypeScript 和必要的类型定义:

```bash
npm install --save-dev typescript @types/node
```

### 2. 导入服务类

```typescript
import { initOpenCodeService, getOpenCodeService } from './src/opencode-service';
```

### 3. 初始化服务

```typescript
// 方法 1: 直接使用初始化函数
const openCodeService = initOpenCodeService('https://api.opencode.ai', {
  timeout: 30000,
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN', // 如果需要认证
  },
});

// 方法 2: 使用单例模式
initOpenCodeService('https://api.opencode.ai');
const openCodeService = getOpenCodeService();
```

### 4. 使用 API 方法

```typescript
// 获取服务器列表
const response = await openCodeService.listServers();
console.log(response.data);

// 创建新服务器
const newServer = await openCodeService.createServer({
  name: 'my-server',
  type: 'production',
});

// 获取服务器详情
const serverDetails = await openCodeService.getServer(serverId);

// 更新服务器
await openCodeService.updateServer(serverId, {
  description: 'Updated description',
});

// 删除服务器
await openCodeService.deleteServer(serverId);
```

## API 方法列表

### 服务器管理

| 方法 | 描述 | HTTP 方法 |
|------|------|-----------|
| `listServers(params)` | 获取服务器列表 | GET |
| `getServer(serverId)` | 获取单个服务器详情 | GET |
| `createServer(data)` | 创建新服务器 | POST |
| `updateServer(serverId, data)` | 更新服务器信息 | PUT |
| `deleteServer(serverId)` | 删除服务器 | DELETE |
| `startServer(serverId)` | 启动服务器 | POST |
| `stopServer(serverId)` | 停止服务器 | POST |
| `restartServer(serverId)` | 重启服务器 | POST |
| `getServerStatus(serverId)` | 获取服务器状态 | GET |
| `getServerLogs(serverId, options)` | 获取服务器日志 | GET |

### 自定义请求

如果需要调用上述方法未涵盖的接口，可以使用 `customRequest` 方法：

```typescript
const response = await openCodeService.customRequest({
  path: 'custom/endpoint',
  method: 'POST',
  body: {
    some: 'data',
  },
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

## 类型定义

### 请求类型

```typescript
interface CreateServerRequest {
  name: string;
  description?: string;
  type?: string;
  config?: Record<string, any>;
}

interface UpdateServerRequest {
  name?: string;
  description?: string;
  config?: Record<string, any>;
}

interface ListServersParams {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
}
```

### 响应类型

```typescript
interface Response<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

interface ServerResponse {
  id: string;
  name: string;
  description?: string;
  type?: string;
  config?: Record<string, any>;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## 错误处理

所有 API 方法都可能抛出错误，建议使用 try-catch 进行处理：

```typescript
try {
  const response = await openCodeService.getServer(serverId);
  console.log(response.data);
} catch (error) {
  console.error('请求失败:', error);
  // 处理错误
}
```

## 配置选项

### HttpClientConfig

```typescript
interface HttpClientConfig {
  baseURL: string;              // API 基础 URL
  timeout?: number;             // 请求超时时间（毫秒），默认 30000
  headers?: Record<string, string>; // 默认请求头
}
```

## 使用示例

详细的使用示例请参考 [`example.ts`](./example.ts) 文件，其中包含了所有 API 方法的使用示例。

### 示例：创建并启动服务器

```typescript
async function createAndStartServer() {
  try {
    // 创建服务器
    const createResponse = await openCodeService.createServer({
      name: 'production-server',
      type: 'production',
      config: {
        region: 'us-east-1',
        size: 'large',
      },
    });

    const serverId = createResponse.data.id;
    console.log('服务器创建成功:', serverId);

    // 启动服务器
    const startResponse = await openCodeService.startServer(serverId);
    console.log('服务器启动成功:', startResponse.data);

    // 检查服务器状态
    const statusResponse = await openCodeService.getServerStatus(serverId);
    console.log('服务器状态:', statusResponse.data);

    return serverId;
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}
```

## 注意事项

1. **API 基础 URL**: 请确保使用正确的 API 基础 URL。如果实际的 API 端点不是 `https://api.opencode.ai`，请相应地修改初始化代码。

2. **认证**: 如果 API 需要认证，请确保在初始化时提供正确的认证令牌。

3. **类型安全**: 本封装提供了完整的 TypeScript 类型定义，建议在项目中启用严格的类型检查以获得最佳的开发体验。

4. **错误处理**: API 调用可能会因为各种原因失败（网络错误、认证失败、服务器错误等），请确保正确处理这些错误情况。

5. **自定义接口**: 如果 OpenCode API 添加了新的接口或现有接口参数发生变化，您可以轻松地修改 [`opencode-service.ts`](./opencode-service.ts) 文件来适配这些变化。

## 获取实际 API 文档

由于无法直接访问 https://opencode.ai/docs/server 网站，本封装中的接口定义是基于常见的服务器管理 API 模式构建的。如有实际的 API 文档，请相应地调整接口定义。

## 贡献

如果您发现任何问题或有改进建议，欢迎提出问题或贡献代码。
