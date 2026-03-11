# 飞书 OpenCode 机器人

基于飞书开放平台开发的 AI 对话机器人，集成 OpenCode AI 服务的流式响应能力，支持在飞书中与 AI 进行实时对话。

## 功能特性

- ✅ 飞书消息接收与回复
- ✅ SSE 流式 AI 响应
- ✅ 会话管理（创建新会话）
- ✅ 完整的 TypeScript 类型支持
- ✅ HTTP 客户端封装
- ✅ OpenCode API 服务封装

## 项目结构

```
feishu/
├── src/
│   ├── index.ts          # 入口文件
│   ├── feishu/
│   │   ├── robot.ts      # 飞书机器人核心逻辑
│   │   └── card.ts       # 卡片消息组件
│   └── opencode/
│       ├── opencode-service.ts # OpenCode API 服务封装
│       ├── http-client.ts # HTTP 客户端
│       ├── example.ts    # 使用示例
│       ├── test.ts       # 功能测试
│       └── README.md     # API 使用文档
└── package.json         # 项目依赖配置
```

## 文档

- [API 接口文档](./docs/api.md)
- [运行日志说明](./docs/log.md)
- [项目概述](./docs/PROJECT_SUMMARY.md)

## 技术栈

- **语言**: TypeScript 5.x
- **运行时**: Node.js
- **飞书 SDK**: @larksuiteoapi/node-sdk
- **SSE 客户端**: eventsource
- **飞书机器人**: WebSocket 客户端模式

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置飞书应用

需要在 [飞书开放平台](https://open.feishu.cn/) 创建应用并配置：

- 获取 `App ID` 和 `App Secret`
- 开启机器人能力
- 配置 WebSocket 权限
- 添加菜单事件（可选）

### 3. 配置修改

编辑 [`robot.ts`](robot.ts:28) 中的配置：

```typescript
const baseConfig = {
  appId: 'YOUR_APP_ID',      // 替换为你的飞书应用 App ID
  appSecret: 'YOUR_APP_SECRET' // 替换为你的飞书应用 App Secret
};

// OpenCode 服务地址（默认指向本地服务）
const BASE = "http://127.0.0.1:4096";
```

### 4. 启动服务

```bash
# 方式一：使用 npm 脚本（推荐）
npm start

# 方式二：直接使用 ts-node 运行
npx ts-node src/feishu/robot.ts
```

服务启动后会建立 WebSocket 连接到飞书平台，开始接收消息。

> 💡 **提示**：确保 OpenCode 服务（默认 `http://127.0.0.1:4096`）已启动，否则机器人无法正常响应 AI 消息。

## 使用说明

### 基本对话流程

1. 用户在飞书中发送消息给机器人
2. 机器人通过 WebSocket 接收消息
3. 通过 OpenCode API 发送消息给 AI 服务
4. AI 通过 SSE 流式返回响应
5. 机器人将响应实时推送给用户

### 创建新会话

机器人支持菜单事件来创建新会话：

- 配置飞书应用菜单（点击事件）
- 用户点击"新建会话"菜单
- 机器人调用 OpenCode API 创建新会话
- 返回会话 ID 供后续使用

### SSE 消息类型

机器人支持以下 SSE 消息类型：

| 类型 | 描述 |
|------|------|
| `message.part.delta` | AI 流式输出片段 |
| `session.status` | 会话状态变更（如 idle 表示完成） |
| `session.error` | 错误信息 |

## API 参考

### 核心模块

#### HttpClient ([`src/http-client.ts`](src/http-client.ts))

通用 HTTP 客户端基类，支持：
- GET、POST、PUT、DELETE、PATCH 请求
- 自动 JSON 序列化/反序列化
- 可配置超时和默认请求头
- 统一的错误处理

#### OpenCodeServerService ([`src/opencode-service.ts`](src/opencode-service.ts))

OpenCode API 服务封装类，提供：
- 会话管理（创建会话）
- 消息发送（异步）
- 服务器状态查询

详细 API 方法请参阅 [`src/README.md`](src/README.md)。

### SSE 客户端示例 ([`sse-client.js`](sse-client.js))

```javascript
const { EventSource } = require('eventsource');

const BASE = "http://127.0.0.1:4096";
const sessionID = "your-session-id";

// 建立 SSE 连接
const es = new EventSource(`${BASE}/event`);

es.onmessage = (e) => {
  const { payload } = JSON.parse(e.data);
  
  // 处理 AI 流式输出
  if (payload.type === "message.part.delta") {
    process.stdout.write(payload.properties.delta);
  }
  
  // 处理完成信号
  if (payload.type === "session.status" && payload.properties.status.type === "idle") {
    es.close();
  }
};

// 发送消息
await fetch(`${BASE}/session/${sessionID}/prompt_async`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    parts: [{ type: "text", text: "你好，请介绍一下自己" }]
  })
});
```

## 配置文件说明

### tsconfig.json

TypeScript 编译配置：
- 目标版本：ES2020
- 模块系统：NodeNext
- 输出目录：./dist

### package.json

项目依赖：
- `@larksuiteoapi/node-sdk` - 飞书 SDK
- `eventsource` - SSE 客户端
- `typescript` - TypeScript 编译器
- `ts-node` - TypeScript 运行工具

## 注意事项

1. **服务地址**：默认指向 `http://127.0.0.1:4096`，请根据实际情况修改
2. **飞书配置**：需要正确配置应用的权限和回调地址
3. **日志输出**：运行日志会写入 `log.txt` 文件
4. **错误处理**：请根据实际业务需求完善错误处理逻辑

## 许可证

ISC