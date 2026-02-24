import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(req: NextRequest) {
    const userId = req.headers.get('x-user-id');
    const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';

    if (!isLoggedIn || !userId) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const history = await storage.getAnalysisHistory(userId);
        return NextResponse.json({ ok: true, data: history });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
