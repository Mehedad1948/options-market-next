'use client';

import { useSignalStream } from '../hooks/use-signal-stream';
import { useUser } from '../providers/user-context';


interface StreamListenerProps {
    settings: {
        notifyWeb: boolean;
    };
}

export default function StreamListener() {
    const user = useUser()
    useSignalStream({ notifyWeb: !!user?.notifyWeb });

    return null;
}
