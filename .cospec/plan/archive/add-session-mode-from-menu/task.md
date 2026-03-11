## 实施

- [x] 1.1 在 robot.ts 中添加全局变量存储会话模式
     【目标对象】`robot.ts`
     【修改目的】添加全局变量 `currentSessionMode` 存储当前会话使用的模式
     【修改方式】在全局变量声明区域添加新的变量
     【相关依赖】现有全局变量 `currentSessionID`
     【修改内容】
        - 在第48行 `let currentSessionID: string = "";` 后添加
        - 添加 `let currentSessionMode: string = "build"; // 默认模式`

- [x] 1.2 扩展菜单事件处理逻辑，识别 build/plan/spec 事件键
     【目标对象】`robot.ts:53-92` (application.bot.menu_v6 事件处理)
     【修改目的】根据不同的菜单事件键创建不同模式的会话，并处理未知事件键回退到默认模式
     【修改方式】修改现有的菜单事件处理逻辑
     【相关依赖】currentSessionID, currentSessionMode 全局变量
     【修改内容】
        - 修改第65行 `if (event_key === 'new')` 条件
        - 扩展为 switch 或 if-else 处理 build/plan/spec/new 事件键
        - 根据 event_key 设置对应的模式：
          - 'build' -> 模式为 'build'
          - 'plan' -> 模式为 'plan'
          - 'spec' -> 模式为 'spec'
          - 'new' -> 保持现有逻辑，模式为 'build'（默认）
        - 在创建会话后将对应模式保存到 currentSessionMode
        - 添加日志记录模式设置
        - **关键边界处理**：未知 event_key（如其他菜单选项）时，设置 currentSessionMode 为 'build'（默认模式），确保系统行为可预测

- [x] 1.3 修改 sendPromptWithSSE 调用使用动态模式
     【目标对象】`robot.ts:146-168` (sendPromptWithSSE 调用)
     【修改目的】使用存储的会话模式而非硬编码 'build'
     【修改方式】替换硬编码的第三个参数
     【相关依赖】currentSessionMode 全局变量
     【修改内容】
        - 修改第149行，将 `'build'` 替换为 `currentSessionMode`
        - 添加日志记录当前使用的模式
