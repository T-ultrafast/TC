import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const userId = req.headers.get('x-user-id');
    const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';
    const { id } = await params;

    if (!isLoggedIn || !userId) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const caseRecord = await storage.getCaseById(id, userId);
        if (!caseRecord) {
            return NextResponse.json({ ok: false, error: "Case not found" }, { status: 404 });
        }

        const attachments = await storage.getAttachments(id, userId);

        return NextResponse.json({
            ok: true,
            data: {
                ...caseRecord,
                attachments
            }
        });
    } catch (error) {
        console.error("Failed to fetch case details:", error);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
