/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventBus } from '@/lib/event-bus';
import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth'; // Import your auth verification



export async function GET(req: NextRequest) {
  // 1. SECURITY CHECK: Verify User Session
  const cookie = req.cookies.get('session')?.value;
  const session = await verifySession(cookie);

  if (!session || !session.userId) {
    // If no session, close connection immediately with 401 Unauthorized
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Setup Encoder
  const encoder = new TextEncoder();

  // 3. Create a stream
  const customReadable = new ReadableStream({
    start(controller) {
      // Define the listener
      const onMessage = (payload: any) => {
        const message = `data: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Subscribe to the bus
      // (Optionally, you could log *who* connected here using session.userId)
      // console.log(`User ${session.userId} connected to stream`);
      eventBus.on('sse-message', onMessage);

      // Handle connection close
      req.signal.addEventListener('abort', () => {
        eventBus.off('sse-message', onMessage);
        console.log(`🍎 Abort connection for user: ${session.userId}`);
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
