'use client';

import { useSignalStream } from '../hooks/use-signal-stream';


interface StreamListenerProps {
    settings: {
        notifyWeb: boolean;
    };
}

export default function StreamListener({ settings }: StreamListenerProps) {
    // This hook handles the SSE connection, router refreshing, and Toast triggering
    useSignalStream(settings);
    
    // This component is logic-only, it renders nothing visible itself
    return null; 
}
