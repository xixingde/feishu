## 实施
- [x] 1.1 创建目录结构
     【目标对象】项目根目录
     【修改目的】建立按功能模块划分的目录结构
     【修改方式】使用 mkdir 创建 src/feishu、src/opencode、docs 目录
     【相关依赖】无新目录依赖，docs 目录若已存在则跳过
     【修改内容】
        - 创建 `src/feishu/` 目录
        - 创建 `src/opencode/` 目录
        - 检查并创建 `docs/` 目录（如果不存在则创建）

- [x] 1.2 移动飞书机器人相关文件
     【目标对象】`robot.ts`, `card.ts`（根目录）
     【修改目的】将飞书机器人代码集中到 src/feishu/ 目录
     【修改方式】使用 mv 命令移动文件，并修改 import 路径
     【相关依赖】依赖于任务 1.1 创建的 src/feishu/ 目录
     【修改内容】
        - 移动 `robot.ts` → `src/feishu/robot.ts`
        - 移动 `card.ts` → `src/feishu/card.ts`
        - 修改 `src/feishu/robot.ts` 中的 import 语句：将 `from './src/opencode-service'` 改为 `from '../opencode/opencode-service'`

- [x] 1.3 移动 OpenCode 服务相关文件
     【目标对象】`src/` 目录下的 OpenCode 相关文件
     【修改目的】将 OpenCode 服务代码集中到 src/opencode/ 目录
     【修改方式】使用 mv 命令移动文件，验证 import 路径
     【相关依赖】依赖于任务 1.1 创建的 src/opencode/ 目录
     【修改内容】
        - 移动 `src/http-client.ts` → `src/opencode/http-client.ts`
        - 移动 `src/opencode-service.ts` → `src/opencode/opencode-service.ts`
        - 移动 `src/example.ts` → `src/opencode/example.ts`
        - 移动 `src/test.ts` → `src/opencode/test.ts`
        - 移动 `src/README.md` → `src/opencode/README.md`
        - 验证 `src/opencode/opencode-service.ts` 中的 import：`from './http-client'` 路径正确（同一目录无需修改）
        - 验证 `src/opencode/example.ts` 中的 import：`from './opencode-service'` 路径正确
        - 验证 `src/opencode/test.ts` 中的 import：`from './http-client'` 和 `from './opencode-service'` 路径正确

- [x] 1.4 创建入口文件
     【目标对象】`src/index.ts`（新创建）
     【修改目的】整合导出所有模块，提供统一入口
     【修改方式】创建新文件并导出各模块
     【相关依赖】依赖于任务 1.2 和 1.3 完成的文件移动
     【修改内容】
        - 创建 `src/index.ts` 文件
        - 导出飞书模块：`export * from './feishu/robot'` 和 `export * from './feishu/card'`
        - 导出 OpenCode 模块：`export * from './opencode/opencode-service'` 和 `export * from './opencode/http-client'`

- [x] 1.5 整理文档文件
     【目标对象】`PROJECT_SUMMARY.md`, `api.md`, `doc/log.md`, `README.md`
     【修改目的】将文档统一放到 docs/ 目录
     【修改方式】使用 mv 命令移动文件，简化或更新根目录 README.md
     【相关依赖】依赖于任务 1.1 创建的 docs/ 目录
     【修改内容】
        - 移动 `PROJECT_SUMMARY.md` → `docs/PROJECT_SUMMARY.md`
        - 移动 `api.md` → `docs/api.md`
        - 移动 `doc/log.md` → `docs/log.md`
        - 更新根目录 `README.md`，添加指向 `docs/` 的链接说明

- [x] 1.6 清理原有空目录
     【目标对象】空的 `src/` 和 `doc/` 目录
     【修改目的】清理重组后的空目录
     【修改方式】使用 rmdir 命令删除空目录
     【相关依赖】依赖于任务 1.2、1.3、1.5 完成的文件移动
     【修改内容】
        - 删除空的 `src/` 目录（移动所有文件后应该为空）
        - 删除空的 `doc/` 目录
