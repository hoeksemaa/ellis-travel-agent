import express from 'express'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())

// POST /api/chat — receives user messages, returns assistant reply
// Replace the stub below with your LLM integration
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array required' })
    return
  }

  // TODO: call your LLM here (e.g. Anthropic SDK, OpenAI, etc.)
  const reply = `Echo: ${messages.at(-1)?.content}`

  res.json({ role: 'assistant', content: reply })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
