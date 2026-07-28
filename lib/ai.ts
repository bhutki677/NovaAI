import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIModel = 'gemini' | 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  files?: string[];
}

export async function generateAIResponse(
  messages: ChatMessage[],
  model: AIModel = 'gemini',
  files?: { name: string; type: string; data?: string }[]
): Promise<string> {
  if (model === 'gemini') {
    return generateWithGemini(messages, files);
  }
  return generateWithOpenAI(messages, files);
}

async function generateWithGemini(
  messages: ChatMessage[],
  files?: { name: string; type: string; data?: string }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('Dummy') || apiKey.includes('Replace')) {
    return `⚠️ **Gemini API Key Not Configured**

Please set your \`GEMINI_API_KEY\` in the \`.env.local\` file.

**How to get a free API key:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key to your .env.local file

You can also configure OpenAI as an alternative.`;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const systemPrompt = `You are NovaAI, an advanced universal AI assistant built by @vxl_404 (Instagram: https://www.instagram.com/vxl_404?igsh=cTJ6a2E4b3gxZ2Ny).

Your mission is to provide the most accurate, useful, and complete responses possible. You are an expert in:
- Writing code (Python, JavaScript, TypeScript, React, Next.js, Java, C++, etc.)
- Debugging software
- Explaining complex concepts
- Creating content (emails, reports, blogs, documentation)
- Mathematics and science
- App and web development
- AI and machine learning

BEHAVIOR RULES:
- Think carefully before answering
- Break difficult tasks into logical steps
- Never invent facts or sources
- If uncertain, explain the uncertainty
- Always give the best possible solution
- Write clean, production-ready code with explanations
- Be professional but friendly
- Use markdown formatting for clarity
- Never reply with just "I don't know" — always provide value

CURRENT TIME: ${new Date().toLocaleString()}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const chat = model.startChat({
      systemInstruction: systemPrompt,
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1];
    let promptText = lastMessage.content;

    // Handle file context
    if (files && files.length > 0) {
      const fileContext = files
        .map(f => `[Attached file: ${f.name} (${f.type})]\n${f.data || ''}`)
        .join('\n\n');
      promptText = `The user has attached file(s). Here's the content:\n\n${fileContext}\n\nUser message: ${promptText}`;
    }

    const result = await chat.sendMessage(promptText);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API error:', error);
    if (error.message?.includes('API key')) {
      return `⚠️ **Invalid Gemini API Key** — Please check your GEMINI_API_KEY in .env.local`;
    }
    return `❌ **Error**: ${error.message || 'Something went wrong with the AI service'}`;
  }
}

async function generateWithOpenAI(
  messages: ChatMessage[],
  files?: { name: string; type: string; data?: string }[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('dummy')) {
    return `⚠️ **OpenAI API Key Not Configured** — Please set \`OPENAI_API_KEY\` in \`.env.local\``;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are NovaAI, an advanced universal AI assistant. Built by @vxl_404. Be accurate, helpful, and complete.`,
          },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated';
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return `❌ **Error**: ${error.message || 'OpenAI service error'}`;
  }
}
