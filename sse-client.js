const { EventSource } = require('eventsource')
const BASE = "http://127.0.0.1:4096"
const sessionID = "ses_32e01407fffeTduvlBMUX58OCS"

async function main() {
  // 1. 先建立 SSE 连接
  const es = new EventSource(`${BASE}/event`)

  es.onmessage = (e) => {
    if (!e.data) {
      console.warn("收到空消息")
      return
    }
    
    let data
    try {
      data = JSON.parse(e.data)
    } catch (err) {
      console.error("JSON 解析失败：", err)
      console.error("原始数据：", e.data)
      return
    }

    const { payload } = data

    if (!payload) {
      console.warn("收到无 payload 的消息：", data)
      return
    }

    // 实时接收 AI 流式输出
    if (payload.type === "message.part.delta"
        && payload.properties?.sessionID === sessionID) {
      process.stdout.write(payload.properties.delta)
    }

    // 监听完成信号
    if (payload.type === "session.status"
        && payload.properties?.sessionID === sessionID
        && payload.properties.status?.type === "idle") {
      console.log("\n[AI 回复完成]")
      es.close()
    }

    // 监听错误
    if (payload.type === "session.error"
        && payload.properties?.sessionID === sessionID) {
      console.error("出错：", payload.properties.error)
      es.close()
    }
  }

  es.onerror = (err) => {
    console.error("SSE 连接错误：", err)
    es.close()
  }

  // 2. 发送异步消息（204 立即返回）
  await fetch(`${BASE}/session/${sessionID}/prompt_async`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parts: [{ type: "text", text: "你好，介绍下自己做什么的" }],
      agent:"StrictSpec"
    })
  })

  console.log("消息已发送，等待 SSE 流式响应...")
}

main().catch(err => {
  console.error("程序出错：", err)
  process.exit(1)
})
