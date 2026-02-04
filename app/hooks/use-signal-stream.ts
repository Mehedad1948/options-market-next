// hooks/use-signal-stream.ts
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner'; // Or your preferred toast lib
import { useRouter } from 'next/navigation';

interface UserSettings {
  notifyWeb: boolean;
}

export function useSignalStream(userSettings: UserSettings | null) {
  const router = useRouter();

  useEffect(() => {
    // Connect to the stream
    const eventSource = new EventSource('/api/stream');

    console.log('🐞🐞🐞', eventSource);

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const { type, data } = payload;

      console.log('New Event Received:', type);

      // --- ACTION 1: ALWAYS REFRESH DATA ---
      // This ensures the dashboard table/charts are always fresh
      // You could also use a state management store (Zustand/Redux) here to update data directly
      router.refresh();

      // --- ACTION 2: CONDITIONALLY NOTIFY ---
      // Only show the popup if the user enabled it in their profile
      console.log('⭕⭕⭕ userSettings?.notifyWeb', userSettings?.notifyWeb);
      
      if (userSettings?.notifyWeb) {
        // Play sound (Optional)
        // const audio = new Audio('/sounds/notification.mp3');
        // audio.play();

        // Show Toast
        toast.success('سیگنال جدید دریافت شد!', {
          description: `${data.symbol} - ${data.type} @ ${data.price}`,
          duration: 5000,
          action: {
            label: 'مشاهده',
            onClick: () => router.push(`/dashboard`),
          },
        });
      }
    };

    eventSource.onerror = () => {
      console.log('SSE Connection lost, retrying...');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userSettings, router]);
}
