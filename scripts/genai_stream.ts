import { GoogleGenAI } from '@google/genai';

// Usage: set GEMINI_API_KEY in environment (already in .env.local) and run with:
// npx ts-node scripts/genai_stream.ts

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set in environment. Set it and retry.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const tools = [
    {
      googleSearch: {},
    },
  ];

  const config = {
    temperature: 0,
    thinkingConfig: {
      thinkingBudget: 8192,
    },
    tools,
  } as const;

  const model = 'gemini-flash-lite-latest';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  console.log('Starting streaming generation...');
  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  for await (const chunk of response) {
    // The chunk API for the genai client yields incremental text parts
    if (chunk.text) {
      process.stdout.write(chunk.text);
    }
  }

  console.log('\nStream complete');
}

main().catch((err) => {
  console.error('Error running stream:', err);
  process.exit(1);
});
