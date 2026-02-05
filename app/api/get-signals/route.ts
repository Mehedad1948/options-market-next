/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { runTalebStrategy } from '@/lib/engine/taleb';



export async function GET() {
  try {
    const result = await runTalebStrategy();
    
    return NextResponse.json({
      status: 'success',
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
        status: 'error', 
        code: 'INTERNAL_ERROR', 
        message: error.message 
    }, { status: 500 });
  }
}
