# 变更：重新组织项目文件结构

## 原因
当前项目文件结构混乱，根目录混杂了多个核心源文件和文档，缺乏清晰的分类。不便于维护和扩展。

## 变更内容
将项目按照功能模块重新组织为以下结构：

```
feishu/
├── src/                          # 源代码目录
│   ├── feishu/                   # 飞书机器人模块
│   │   ├── robot.ts              # 机器人主逻辑
│   │   └── card.ts               # 卡片消息组件
│   ├── opencode/                 # OpenCode HTTP 服务模块
│   │   ├── http-client.ts        # HTTP 客户端基类
│   │   ├── opencode-service.ts   # OpenCode API 服务封装
│   │   ├── example.ts            # 使用示例
│   │   ├── test.ts               # 功能测试
│   │   └── README.md             # 模块文档
│   └── index.ts                  # 入口文件（整合导出）
├── examples/                     # 独立示例（可选）
├── docs/                         # 项目文档
│   ├── README.md                 # 项目主文档
│   ├── PROJECT_SUMMARY.md        # 项目总结
│   ├── api.md                    # API 参考文档
│   └── log.md                    # 日志记录
├── .cospec/                      # Cospec 配置（保持不变）
├── package.json                  # 项目配置
├── tsconfig.json                 # TS 配置
├── .gitignore                    # Git 配置
└── README.md                     # 入口文档（软链接或简化版）
```

- [ ] **BREAKING**: 源代码路径变更，所有 import 路径需要更新
- [ ] **BREAKING**: 删除原有的 `src/README.md`

## 影响
- **受影响的规范**：项目结构规范
- **受影响的代码**：
    - `robot.ts` → `src/feishu/robot.ts`
    - `card.ts` → `src/feishu/card.ts`
    - `src/http-client.ts` → `src/opencode/http-client.ts`
    - `src/opencode-service.ts` → `src/opencode/opencode-service.ts`
    - `src/example.ts` → `src/opencode/example.ts`
    - `src/test.ts` → `src/opencode/test.ts`
    - `src/README.md` → `src/opencode/README.md`
    - `doc/log.md` → `docs/log.md`
    - 新增 `docs/` 目录存放文档文件
