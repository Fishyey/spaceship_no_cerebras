const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse"

export const KEY_STORAGE = "gemini-api-key"

export const storedGeminiKey = () => localStorage.getItem(KEY_STORAGE)?.trim()

export type CompletionRequest = {
  apiKey: string
  system: string
  user: string
  temperature: number
  maxCompletionTokens: number
  signal: AbortSignal
}

export async function* streamCompletion({ apiKey, system, user, temperature, maxCompletionTokens, signal }: CompletionRequest) {
  const response = await fetch(API_URL, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature, maxOutputTokens: maxCompletionTokens, thinkingConfig: { thinkingLevel: "MINIMAL" } },
    }),
  })

  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`)
  if (!response.body) throw new Error("no response body")

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += value
      const events = buffer.split(/\r?\n\r?\n/)
      buffer = events.pop() ?? ""
      for (const event of events) yield* textFromEvent(event)
    }
    if (buffer) yield* textFromEvent(buffer)
  } finally {
    await reader.cancel()
  }
}

function* textFromEvent(event: string) {
  const data = event
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n")
  if (!data || data === "[DONE]") return
  const parts = JSON.parse(data).candidates?.[0]?.content?.parts as { text?: string }[] | undefined
  for (const part of parts ?? []) if (part.text) yield part.text
}
