import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, model } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    // Try Gemini image generation if API key is set
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.includes('Dummy')) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Generate an image based on this description: ${prompt}. Return the image.`
                }]
              }],
              generationConfig: {
                responseModalities: ['Text', 'Image']
              }
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const parts = data.candidates?.[0]?.content?.parts || [];

          for (const part of parts) {
            if (part.inlineData) {
              const base64Image = part.inlineData.data;
              return NextResponse.json({
                success: true,
                image: `data:${part.inlineData.mimeType || 'image/png'};base64,${base64Image}`,
                model: 'gemini',
              });
            }
          }
        }
      } catch (err) {
        console.error('Gemini image gen failed:', err);
      }
    }

    // Try OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && !openaiKey.includes('dummy')) {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          image: data.data[0].url,
          model: 'openai',
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'No image generation API key configured. Add GEMINI_API_KEY or OPENAI_API_KEY to .env.local',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
