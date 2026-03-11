import * as Lark from '@larksuiteoapi/node-sdk';
import { EventSource } from 'eventsource';
import { initOpenCodeService, getOpenCodeService } from '../opencode/opencode-service';
import * as fs from 'fs';
import * as path from 'path';

// 日志文件路径
const LOG_FILE = path.join(process.cwd(), 'log.txt');

// 写入日志到文件
function writeLog(message: string, type: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
  
  // 写入文件
  fs.appendFileSync(LOG_FILE, logMessage, 'utf-8');
  
  // 同时输出到控制台
  if (type === 'error') {
    console.error(message);
  } else if (type === 'warn') {
    console.warn(message);
  } else {
    console.log(message);
  }
}

const baseConfig = {
  appId: 'cli_a92483a5d8fa1bd3',
  appSecret: 'Yaddp1iFlilVQt9em6t2AfucKGYjMYkA'
}

const client = new Lark.Client(baseConfig);
const wsClient = new Lark.WSClient({...baseConfig, loggerLevel: Lark.LoggerLevel.debug});
const BASE = "http://127.0.0.1:4096";

// 初始化 OpenCode 服务
const openCodeService = initOpenCodeService(BASE);

// 使用 Map 存储每个会话的 SSE 连接和响应内容
const sessionMap = new Map<string, {
  eventSource: EventSource;
  accumulatedContent: string;
  chat_id: string;
}>();

// 全局 session_id，用于复用（初始化为空）
let currentSessionID: string = "";
let currentSessionMode: string = "build"; // 默认模式

wsClient.start({
  // 处理「接收消息」事件，事件类型为 im.message.receive_v1
  eventDispatcher: new Lark.EventDispatcher({}).register({
    'application.bot.menu_v6': async (data) => {
        const { event_key, operator } = data;
        writeLog(`菜单事件触发: event_key=${event_key}, operator=${JSON.stringify(operator)}`);
        
        // 提取用户 ID
        const openId = operator?.operator_id?.open_id;
        if (!openId) {
            writeLog(`菜单事件: 无法获取用户 ID ${JSON.stringify(data)}`, 'error');
          return;
        }
        
        // 处理新建会话菜单事件
        let sessionMode = "build"; // 默认为 build 模式
        
        switch (event_key) {
            case 'build':
                sessionMode = "build";
                writeLog('菜单事件: 创建 build 模式会话');
                break;
            case 'plan':
                sessionMode = "plan";
                writeLog('菜单事件: 创建 plan 模式会话');
                break;
            case 'spec':
                sessionMode = "spec";
                writeLog('菜单事件: 创建 spec 模式会话');
                break;
            case 'new':
            default:
                // 'new' 或其他未知事件键都使用默认的 build 模式
                sessionMode = "build";
                writeLog(`菜单事件: 创建新会话 (event_key: ${event_key}, 使用默认 build 模式)`);
                break;
        }
        
        // 发送创建新会话的请求（使用 opencode-service 接口）
        // session_id 是由接口返回的，不是程序生成的
        const sessionResponse = await openCodeService.createSession({
            title: "新会话"
        });
        writeLog(`新会话创建结果: ${JSON.stringify(sessionResponse)}`);
        
        // 从接口响应中获取 session_id
        const sessionID = sessionResponse?.data?.id;
        if (!sessionID) {
            writeLog(`创建会话失败：未获取到 session_id ${JSON.stringify(sessionResponse)}`, 'error');
            sendReplyToLarkRecipient(openId, "创建会话失败，请重试。");
            return;
        }
        writeLog(`创建新会话, sessionID: ${sessionID}, 模式: ${sessionMode}`);
        
        // 保存 session_id 和 session_mode 到全局变量，供 im.message.receive_v1 复用
        currentSessionID = sessionID;
        currentSessionMode = sessionMode;
        writeLog(`全局 session_id 已更新: ${currentSessionID}, 模式: ${currentSessionMode}`);
        
        // 返回事件名给客户端
        const eventMessage = `菜单事件: ${event_key}`;
        sendReplyToLarkRecipient(openId, eventMessage);
    },
    'im.message.receive_v1': async (data) => {
      const {
        message: { chat_id, content }
      } = data;
      
      // 解析消息内容，获取用户发送的文本
      let userMessage = "";
      try {
        const parsedContent = JSON.parse(content);
        userMessage = parsedContent.text || "";
      } catch (err) {
        writeLog(`解析消息内容失败: ${err}`, 'error');
        userMessage = content || "";
      }
      
      if (!userMessage) {
        writeLog('收到空消息，跳过处理', 'warn');
        return;
      }
      
      writeLog(`收到用户消息: ${userMessage}, chat_id: ${chat_id}`);
      
      // 检查是否有可复用的 session_id
      let sessionID = currentSessionID;
      
      if (!sessionID) {
        // 没有可复用的 session_id，需要创建新会话
        writeLog('当前没有可复用的 session_id，正在创建新会话...');
        
        const sessionResponse = await openCodeService.createSession({
          title: "新会话"
        });
        writeLog(`新会话创建结果: ${JSON.stringify(sessionResponse)}`);
        
        // 从接口响应中获取 session_id
        sessionID = sessionResponse?.data?.id;
        if (!sessionID) {
          writeLog(`创建会话失败：未获取到 session_id ${JSON.stringify(sessionResponse)}`, 'error');
          sendReplyToLark(chat_id, "创建会话失败，请重试。");
          return;
        }
        
        // 保存新创建的 session_id 到全局变量
        currentSessionID = sessionID;
        writeLog(`新会话已创建，全局 session_id 已更新: ${currentSessionID}`);
      } else {
        // 复用已有的 session_id
        writeLog(`复用已有 session_id: ${sessionID}`);
      }
      
      // 使用 sendPromptWithSSE 方法发送消息并接收流式响应
      let accumulatedContent = "";
      
      // 记录当前使用的会话模式
      writeLog(`会话 ${sessionID}: 使用模式 "${currentSessionMode}" 发送消息`);
      
      await openCodeService.sendPromptWithSSE(
        sessionID,
        userMessage,
        currentSessionMode,
        {
          onDelta: (delta, sID) => {
            accumulatedContent += delta;
            writeLog(`会话 ${sID}: 收到流式内容: ${delta}`);
          },
          onComplete: (sID) => {
            writeLog(`会话 ${sID}: AI 回复完成，准备发送到飞书`);
            // 发送完整回复到飞书
            sendReplyToLark(chat_id, accumulatedContent);
            sessionMap.delete(sID);
          },
          onError: (error, sID) => {
            writeLog(`会话 ${sID}: 出错 ${JSON.stringify(error)}`, 'error');
            // 发送错误消息到飞书
            sendReplyToLark(chat_id, `处理过程中出错: ${error}`);
            sessionMap.delete(sID);
          }
        }
      );
      
      writeLog(`会话 ${sessionID}: 消息已发送，等待 SSE 流式响应...`);
    }
  })
});

// 发送回复到飞书的辅助函数
async function sendReplyToLark(chat_id: string, content: string) {
  try {
    const result = await client.im.message.create({
      params: {
        receive_id_type: "chat_id"
      },
      data: {
        receive_id: chat_id,
        msg_type: "text",
        content: JSON.stringify({ text: content })
      }
    });
    
    writeLog(`消息已发送到飞书 chat_id: ${chat_id}, 结果: ${JSON.stringify(result)}`);
  } catch (error) {
    writeLog(`发送消息到飞书失败，chat_id: ${chat_id}, 错误: ${error}`, 'error');
  }
}

// 发送回复到飞书用户（使用 open_id）的辅助函数
async function sendReplyToLarkRecipient(open_id: string, content: string) {
  try {
    const result = await client.im.message.create({
      params: {
        receive_id_type: "open_id"
      },
      data: {
        receive_id: open_id,
        msg_type: "text",
        content: JSON.stringify({ text: content })
      }
    });
    
    writeLog(`消息已发送到飞书用户 open_id: ${open_id}, 结果: ${JSON.stringify(result)}`);
  } catch (error) {
    writeLog(`发送消息到飞书失败，open_id: ${open_id}, 错误: ${error}`, 'error');
  }
}