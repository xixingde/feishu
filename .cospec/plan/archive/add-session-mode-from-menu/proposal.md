# 变更：根据菜单事件创建不同模式的会话

## 原因
用户通过飞书机器人菜单创建会话时，需要根据不同的菜单选项（build/plan/spec）创建不同模式的会话，并在后续消息交互中使用对应的模式。当前实现硬编码使用 'build' 模式，无法满足用户对会话模式的差异化需求。

## 变更内容
- 扩展菜单事件处理，识别 build、plan、spec 类型的 event_key
- 添加全局变量 `currentSessionMode` 存储当前会话模式
- 在创建会话时根据菜单事件设置对应的模式
- 在 `sendPromptWithSSE` 调用时使用存储的会话模式而非硬编码
- 新增未知 event_key 的处理逻辑（回退到默认模式）

## 影响
- **受影响的代码**：
  - `robot.ts`:
    - 添加全局变量 `currentSessionMode` 存储会话模式
    - 扩展菜单事件处理逻辑，识别 build/plan/spec 事件键
    - 修改 `sendPromptWithSSE` 调用，使用动态模式而非硬编码 'build'
    - 添加日志记录模式切换
