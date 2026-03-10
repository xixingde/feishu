import * as Lark from '@larksuiteoapi/node-sdk';
import { EventSource } from 'eventsource';

const baseConfig = {
  appId: 'cli_a92483a5d8fa1bd3',
  appSecret: 'Yaddp1iFlilVQt9em6t2AfucKGYjMYkA'
}

const client = new Lark.Client(baseConfig);
const wsClient = new Lark.WSClient({...baseConfig, loggerLevel: Lark.LoggerLevel.debug});
const BASE = "http://127.0.0.1:4096";

// 使用 Map 存储每个会话的 SSE 连接和响应内容
const sessionMap = new Map<string, {
  eventSource: EventSource;
  accumulatedContent: string;
  chat_id: string;
}>();

wsClient.start({
  // 处理「接收消息」事件，事件类型为 im.message.receive_v1
  eventDispatcher: new Lark.EventDispatcher({}).register({
    'application.bot.menu_v6': async (data) => {
        console.log(data);
    },
    'im.message.receive_v1': async (data) => {
      const {
        message: { chat_id, content}
      } = data;
      
      const sessionID = "ses_32ceed42cffe6aMDCJTan8mPvn";
      console.log(`接收到消息，创建会话 ID: ${sessionID}`);
      
      // 建立新的 SSE 连接
      const eventSource = new EventSource(`${BASE}/event`);
      let accumulatedContent = "";
      
      eventSource.onmessage = (e) => {
        if (!e.data) {
          console.warn(`会话 ${sessionID}: 收到空消息`);
          return;
        }
        
        let parsedData: any;
        try {
          parsedData = JSON.parse(e.data);
        } catch (err) {
          console.error(`会话 ${sessionID}: JSON 解析失败`, err);
          return;
        }
        
        const messageType = parsedData.type || parsedData.payload?.type;
        const properties = parsedData.properties || parsedData.payload?.properties;
        const sessionIDFromMsg = properties?.sessionID || parsedData.sessionID || parsedData.payload?.sessionID;
        
        console.log(`会话 ${sessionID}: 收到消息 type=${messageType}, properties.sessionID=${sessionIDFromMsg}`);
        
        // 检查是否为当前会话的消息
        if (sessionIDFromMsg && sessionIDFromMsg !== sessionID) {
          console.log(`会话 ${sessionID}: 忽略其他会话的消息 ${sessionIDFromMsg}`);
          return;
        }
        
        // 实时接收 AI 流式输出
        if (messageType === "message.part.delta") {
          const delta = properties?.delta || parsedData.delta;
          if (delta) {
            accumulatedContent += delta;
            console.log(`会话 ${sessionID}: 收到流式内容: ${delta}`);
          }
        }
        
        // 监听完成信号
        if (messageType === "session.status"
            && properties?.status?.type === "idle") {
          console.log(`会话 ${sessionID}: AI 回复完成，准备发送到飞书`);
          
          // 发送完整回复到飞书
          sendReplyToLark(chat_id, accumulatedContent);
          
          // 清理资源
          eventSource.close();
          sessionMap.delete(sessionID);
        }
        
        // 监听错误
        if (messageType === "session.error") {
          const error = properties?.error || parsedData.error;
          console.error(`会话 ${sessionID}: 出错`, error);
          
          // 发送错误消息到飞书
          sendReplyToLark(chat_id, `处理过程中出错: ${error}`);
          
          eventSource.close();
          sessionMap.delete(sessionID);
        }
      };
      
      eventSource.onerror = (err) => {
        console.error(`会话 ${sessionID}: SSE 连接错误`, err);
        eventSource.close();
        sessionMap.delete(sessionID);
      };
      
      // 存储会话信息
      sessionMap.set(sessionID, {
        eventSource,
        accumulatedContent,
        chat_id
      });
      
      // 发送异步消息
      await fetch(`${BASE}/session/${sessionID}/prompt_async`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parts: [{ type: "text", text: content}],
          agent:"StrictSpec"
        })
      });
      
      console.log(`会话 ${sessionID}: 消息已发送，等待 SSE 流式响应...`);
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
    
    console.log(`消息已发送到飞书 chat_id: ${chat_id}, 结果:`, result);
  } catch (error) {
    console.error(`发送消息到飞书失败，chat_id: ${chat_id}, 错误:`, error);
  }
}