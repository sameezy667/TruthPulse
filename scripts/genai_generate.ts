import { readFileSync } from 'fs'
import { GoogleGenerativeAI } from '@google/generative-ai'

function loadEnvLocal(): void {
  if (process.env.GEMINI_API_KEY) return
  try {
    const raw = readFileSync('.env.local', 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/)
      if (m) {
        const [, k, v] = m
        process.env[k] = v.trim()
      }
    }
  } catch (e) {
    // ignore missing file
  }
}

loadEnvLocal()

async function main() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set in environment (.env.local).')
    process.exit(1)
  }

  const prompt = process.argv.slice(2).join(' ') || 'Explain how to check if an image contains a person in plain English.'

  const client = new GoogleGenerativeAI(apiKey)

  const candidates = [
    'models/gemini-2.5-flash-lite',
    'models/gemini-2.5-flash',
    'models/gemini-flash-lite-latest',
    'models/gemini-flash-latest',
    'gemini-1.5-flash',
    'models/text-bison-001',
    'text-bison-001',
    'models/text-bison-2',
  ]
  let lastError: any = null
  let text = ''

  for (const candidate of candidates) {
    try {
      const model = client.getGenerativeModel({ model: candidate })
      const result = await model.generateContent([prompt])
      text = result.response.text()
      break
    } catch (err: any) {
      lastError = err
      // try next candidate
    }
  }

  if (!text) {
    // Attempt to list models if available to help debugging
    try {
      // @ts-ignore
      const list = typeof (client as any).listModels === 'function' ? await (client as any).listModels() : null
      console.error('No candidate model worked. Last error:', lastError?.message || lastError)
      if (list) {
        console.error('Available models (from client.listModels):', JSON.stringify(list, null, 2))
      } else {
        // Fallback: call REST ListModels with API key
        try {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
          const json = await resp.json()
          console.error('Available models (REST):', JSON.stringify(json, null, 2))
        } catch (e) {
          console.error('Failed to fetch models via REST fallback:', e)
        }
      }
    } catch (e) {
      console.error('No candidate model worked. Last error:', lastError?.message || lastError)
    }
    process.exit(3)
  }
  // Print a streaming-like output by emitting chunks with a short delay
  const chunkSize = 120
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize)
    process.stdout.write(chunk)
    await new Promise((r) => setTimeout(r, 120))
  }
  process.stdout.write('\n')
}

main()
