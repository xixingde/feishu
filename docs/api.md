const BASE = "http://127.0.0.1:4096/session/ses_32e01407fffeTduvlBMUX58OCS/prompt_async"
const sessionID = "ses_abc123"

// 1. 先建立 SSE 连接
const es = new EventSource(`${BASE}/event`)

es.onmessage = (e) => {
  const { payload } = JSON.parse(e.data)

  // 实时接收 AI 流式输出
  if (payload.type === "message.part.delta"
      && payload.properties.sessionID === sessionID) {
    process.stdout.write(payload.properties.delta)
  }

  // 监听完成信号
  if (payload.type === "session.status"
      && payload.properties.sessionID === sessionID
      && payload.properties.status.type === "idle") {
    console.log("\n[AI 回复完成]")
    es.close()
  }

  // 监听错误
  if (payload.type === "session.error"
      && payload.properties.sessionID === sessionID) {
    console.error("出错：", payload.properties.error)
    es.close()
  }
}

// 2. 发送异步消息（204 立即返回）
await fetch(`${BASE}/session/${sessionID}/prompt_async`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    parts: [{ type: "text", text: "你好，请介绍一下自己" }]
  })
})
