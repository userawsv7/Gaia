import { NextRequest } from 'next/server';
import { aiRouter } from '@/lib/ai-router';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, requestType, temperature, maxTokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // Add coaching system prompt as first message
    const systemPrompt = {
      role: 'system' as const,
      content: `You are a seasoned software testing coach. Be direct, concise, and actionable.
- Keep responses short (2-4 sentences max)
- Give specific, practical advice
- Use coaching language: "Try this...", "Focus on...", "Start with..."
- No lengthy explanations unless asked
- Be encouraging but brief`
    };

    const messagesWithSystem = [systemPrompt, ...messages];

    // Create streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start async streaming
    (async () => {
      try {
        for await (const chunk of aiRouter.streamChat(messagesWithSystem as any, {
          requestType,
          temperature,
          maxTokens,
        })) {
          if (chunk.model) {
            // Send model info first
            const data = JSON.stringify({ type: 'model', model: chunk.model });
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          } else if (chunk.content) {
            // Send content chunks
            const data = JSON.stringify({ type: 'content', content: chunk.content });
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          } else if (chunk.done) {
            // Signal completion
            const data = JSON.stringify({ type: 'done' });
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          }
        }
      } catch (error: any) {
        const errorData = JSON.stringify({
          type: 'error',
          message: error.message || 'An error occurred',
        });
        await writer.write(encoder.encode(`data: ${errorData}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}