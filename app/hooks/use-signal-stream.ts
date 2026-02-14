// hooks/use-signal-stream.ts
'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserSettings {
  notifyWeb: boolean;
  // You might want to add a specific flag for native vs toast if needed
  // nativeNotify?: boolean; 
}

export function useSignalStream(userSettings: UserSettings | null) {
  const router = useRouter();

  // --- HELPER: Send Native Notification ---
  const sendNativeNotification = useCallback((title: string, body: string) => {
    // 1. Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    // 2. Check permission
    if (Notification.permission === 'granted') {
      // 3. Create Notification
      const notification = new Notification(title, {
        body: body,
        icon: '/notif-icon.jpg', // Add your app logo path here
        dir: 'rtl', // Important for Persian
        lang: 'fa-IR',
        tag: 'signal-alert', // Prevents stacking too many notifications
        silent: false,
      });

      // 4. Handle Click (Focus the tab)
      notification.onclick = function () {
        window.focus();
        notification.close();
        router.push('/dashboard');
      };
    } else if (Notification.permission !== 'denied') {
      // Optional: Request permission if not denied yet (though better done via UI button)
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }, [router]);


  useEffect(() => {
    // Connect to SSE
    const eventSource = new EventSource('/api/stream');

    console.log('📡 Connected to Signal Stream');

    eventSource.onmessage = (event) => {
      // Parse Data
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch (e) {
        console.error('JSON Parse Error', e);
        return;
      }
      
      const { type, data } = payload;
      
      // 1. Refresh Data
      router.refresh();

      // 2. Check Settings
      if (userSettings?.notifyWeb) {
        const title = 'سیگنال جدید! 🚀';
        const body = `${data.symbol} - ${data.type === 'call' ? 'خرید' : 'فروش'} @ ${data.price}`;

        // A. Show In-App Toast (Sonner)
        toast.success(title, {
          description: body,
          duration: 5000,
          action: {
            label: 'مشاهده',
            onClick: () => router.push(`/dashboard`),
          },
        });

        // B. Play Sound (Optional - highly recommended for signals)
        try {
           const audio = new Audio('/sounds/notification.mp3'); 
           audio.play().catch(e => console.log('Audio play failed', e));
        } catch(e) { /* ignore */ }

        // C. Show Native Notification (Windows/Mobile System Tray)
        // We trigger this ONLY if the user is looking away (document.hidden) 
        // OR always, depending on your preference.
        if (document.hidden) {
           sendNativeNotification(title, body);
        } else {
           // If user is looking at the screen, maybe just toast is enough?
           // If you want BOTH always, remove the 'if (document.hidden)' check.
           sendNativeNotification(title, body);
        }
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userSettings, router, sendNativeNotification]);
}
