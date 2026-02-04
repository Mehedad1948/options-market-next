/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/stream/route.ts
import { eventBus } from '@/lib/event-bus';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  console.log('❌❌❌ api stream');

  // Create a stream
  const customReadable = new ReadableStream({
    start(controller) {
      // 1. Define the listener
      const onMessage = (payload: any) => {
        const message = `data: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // 2. Subscribe to the bus
      eventBus.on('sse-message', onMessage);

      // 3. Handle connection close
      req.signal.addEventListener('abort', () => {
        eventBus.off('sse-message', onMessage);
        console.log('🍎🍎🍎 Abort');
        
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
