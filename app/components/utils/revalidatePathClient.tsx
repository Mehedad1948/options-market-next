'use client'

import { revalidatePathAction } from '@/app/actions/revalidatePathAction';
import { useEffect } from 'react';

export default function RevalidatePathClient({ path, type }: { path: string, type?: 'layout' | 'page' }) {

    useEffect(() => {
        revalidatePathAction(path, type)
    }, [])
    return null
}